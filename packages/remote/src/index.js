'use strict';

const {
  spawn,
  spawnAwait,
} = require('./cp');
require('@faltest/utils/src/require-before-webdriverio');
const { remote } = require('webdriverio');
const psList = require('ps-list');
const fkill = require('fkill');
const getPort = require('get-port');
const debug = require('./debug');
const log = require('./log');
const EventEmitter = require('events');
const yn = require('yn');
const { defaults } = require('@faltest/utils');
// const config = require('config');

// We aren't using `@wdio/cli` (wdio testrunner)
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';

let port;

const webDriverRegex = /^(chromedriver(?:\.exe)?|geckodriver)$/;
const browserNameRegex = (() => {
  let linux = 'chrome';
  let mac = 'Google Chrome|firefox-bin';
  let win = 'chrome\\.exe';
  return new RegExp(`^(${linux}|${mac}|${win})$`);
})();
const browserCmdRegex = (() => {
  let chrome = '--enable-automation';
  let firefox = '-marionette';
  return new RegExp(`(${chrome}|${firefox})`);
})();

function getDefaults() {
  // let browser = config.get('browser') || defaults.browser;
  // let headless = yn(config.get('headless'));

  let browser = process.env.WEBDRIVER_BROWSER || defaults.browser;
  let headless = yn(process.env.WEBDRIVER_HEADLESS);

  let logLevel = debug.verbose.enabled ? 'trace' : debug.enabled ? 'warn' : 'silent';

  return {
    browser,
    headless,
    logLevel,
  };
}

let events = new EventEmitter();

async function killOrphans() {
  let processes = await module.exports.psList();

  let orphanedWebDrivers = processes.filter(({ name, pid, ppid }) => {
    debug.verbose(`found process ${name} pid ${pid} ppid ${ppid}`);
    return webDriverRegex.test(name);
  });
  let orphanedBrowsers = processes.filter(({ name, cmd, ppid }) => {
    if (!browserNameRegex.test(name)) {
      return;
    }
    let isAboutToBeOrphaned = orphanedWebDrivers.some(({ pid }) => pid === ppid);
    if (isAboutToBeOrphaned) {
      return true;
    }
    let isAlreadyOrphaned = browserCmdRegex.test(cmd) && ppid === 1;
    if (isAlreadyOrphaned) {
      return true;
    }
  });

  async function kill(orphan) {
    debug('killing orphan');
    debug(`${orphan.cmd} ${orphan.pid}`);
    try {
      await module.exports.fkill(orphan.pid, {
        force: process.platform === 'win32',
      });
    } catch (err) {
      if (/(Process doesn't exist|No such process)/.test(err.message)) {
        debug(err.message);
      } else {
        // Sometimes you get "Killing process 30602 failed"
        // and there doesn't seem to be anything you can do about it?
        // throw err;

        debug(err.message);
      }
    }
  }

  for (let orphan of orphanedBrowsers.concat(orphanedWebDrivers)) {
    await kill(orphan);
  }

  events.emit('kill-orphans');
}

async function getNewPort(port) {
  if (!port || port === '0') {
    port = (await getPort()).toString();
    debug(`using random open port ${port}`);
  } else {
    debug(`using port ${port}`);
  }
  return port;
}

async function _getNewPort(_port) {
  if (!_port) {
    // _port = config.get('port');
    _port = process.env.WEBDRIVER_PORT;
  }
  return port = await getNewPort(_port);
}

async function spawnWebDriver(name, args) {
  await spawnAwait(name, ['--version']);

  let webDriver = spawn(name, args, {
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  // webDriver.stdout.pipe(process.stdout);

  // https://github.com/sindresorhus/execa/issues/173
  delete webDriver.then;
  delete webDriver.catch;

  return webDriver;
}

function startWebDriver(options = {}) {
  return log(async () => {
    await killOrphans();

    let { overrides = {} } = options;
    let _browser = overrides.browser || getDefaults().browser;

    await _getNewPort(overrides.port);

    let driverName;
    let driverArgs;

    switch (_browser) {
      case 'chrome':
        driverName = 'chromedriver';
        driverArgs = [`--port=${port}`];
        break;
      case 'firefox':
        driverName = 'geckodriver';
        driverArgs = ['--port', port];
        break;
    }

    let webDriver = await spawnWebDriver(driverName, driverArgs);

    await new Promise(resolve => {
      switch (_browser) {
        case 'chrome': {
          // I believe this is an eslint bug
          // This code should be passing for ES6, according to the docs
          // https://eslint.org/docs/5.0.0/rules/no-inner-declarations
          // eslint-disable-next-line no-inner-declarations
          function wait(data) {
            if (data.toString().includes('Starting ChromeDriver')) {
              resolve();

              webDriver.stdout.removeListener('data', wait);
            }
          }

          webDriver.stdout.on('data', wait);

          break;
        }
        case 'firefox': {
          // ff doesn't print anything,
          // so it appears it is immediately available?
          resolve();

          break;
        }
      }
    });

    // There's a flaw with the logic in https://github.com/IndigoUnited/node-cross-spawn/issues/16.
    // If you mark `shell: true`, then it skips validating that the file exists.
    // Then when we force kill the process, it's error handling logic kicks in
    // and says, "Oh the file doesn't exist? Then throw a ENOENT error."
    if (process.platform === 'win32') {
      let { emit } = webDriver;

      webDriver.emit = function(eventName, exitCode) {
        if (eventName === 'exit' && exitCode === 1) {
          return true;
        }

        return emit.apply(webDriver, arguments);
      };
    }

    webDriver.once('exit', killOrphans);

    return webDriver;
  });
}

function stopWebDriver(webDriver) {
  return log(async () => {
    if (!webDriver) {
      return;
    }

    webDriver.removeListener('exit', killOrphans);

    webDriver.kill();

    await new Promise(resolve => {
      webDriver.once('exit', resolve);
    });
  });
}

async function getCapabilities({
  customizeCapabilities = (browserName, capabilities) => capabilities,
  overrides: {
    browser: _browser = getDefaults().browser,
  } = {},
}) {
  let capabilities = {
    browserName: _browser,
  };

  let headless = getDefaults().headless;

  let browserCapabilities;

  switch (_browser) {
    case 'chrome': {
      let args = [];
      if (headless) {
        args.push('--headless');
      }
      browserCapabilities = {
        args,
      };
      capabilities['goog:chromeOptions'] = browserCapabilities;
      break;
    }
    case 'firefox': {
      let args = [];
      if (headless) {
        args.push('-headless');
      }
      browserCapabilities = {
        args,
      };
      capabilities['moz:firefoxOptions'] = browserCapabilities;
      break;
    }
  }

  await customizeCapabilities(_browser, browserCapabilities);

  return capabilities;
}

function startBrowser(options = {}) {
  return log(async () => {
    let { overrides = {} } = options;
    let browser;
    let connectionRetryCount = 150;

    try {
      // We should refrain from using the `baseUrl` option here
      // because subdomain can change as you navigate your app
      browser = await remote({
        logLevel: overrides.logLevel || getDefaults().logLevel,
        path: '/',
        port: parseInt(port),
        capabilities: await getCapabilities(options),
        waitforTimeout: overrides.waitforTimeout !== undefined ? overrides.waitforTimeout : defaults.timeout,

        // this is only needed for geckodriver because
        // it takes a while to boot up and doesn't notify
        // you via console output
        // `connectionRetryTimeout` seems like it would be a better option,
        // but the connections fail immediately and the timeout isn't even hit
        connectionRetryCount,
      });
    } catch (err) {
      debug(`It is possible \`connectionRetryCount=${connectionRetryCount}\` is not high enough.`);

      throw err;
    }

    await resizeBrowser(browser, overrides.size);

    return browser;
  });
}

async function resizeBrowser(browser, size) {
  let _size = process.env.WEBDRIVER_SIZE;
  if (size !== undefined) {
    _size = size;
  }

  if (_size) {
    let [width, height] = _size.split(',').map(s => parseInt(s));

    await browser.setWindowSize(width, height);
  }

  debug('browser.getWindowSize');
  debug(await browser.getWindowSize());
}

function stopBrowser(browser) {
  return log(async () => {
    if (!browser) {
      return;
    }

    if (browser.close) {
      // We should probably remove the browser wrapper expectance
      // as it violates separation of concerns.
      await browser.close();
    } else {
      await browser.closeWindow();
    }
  });
}

module.exports.psList = psList;
module.exports.fkill = fkill;
module.exports.killOrphans = killOrphans;
module.exports.getNewPort = getNewPort;
module.exports.startWebDriver = startWebDriver;
module.exports.stopWebDriver = stopWebDriver;
module.exports.startBrowser = startBrowser;
module.exports.stopBrowser = stopBrowser;
module.exports.resizeBrowser = resizeBrowser;
module.exports.events = events;
