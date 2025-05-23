'use strict';

const { spawn } = require('./cp');
require('@faltest/utils/src/require-before-webdriverio');
const { remote } = require('webdriverio');
const debug = require('./debug');
const log = require('./log');
const EventEmitter = require('events-async');
const {
  defaults,
} = require('@faltest/utils');
const os = require('os');
// const config = require('config');

// We aren't using `@wdio/cli` (wdio testrunner)
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';

const platform = os.platform();

const ChromeDriverName = 'chromedriver';
const FirefoxDriverName = 'geckodriver';
const EdgeDriverName = 'msedgedriver';

let port;

const webDriverRegex = /^(chromedriver(?:\.exe)?|geckodriver(?:\.exe)?|msedgedriver(?:\.exe)?)$/;
const browserNameRegex = (() => {
  switch (platform) {
    case 'linux': return /^(chrome|firefox|msedge)$/;
    case 'darwin': return /^(Google Chrome|firefox-bin|Microsoft Edge)$/;
    case 'win32': return /^(chrome\.exe|firefox\.exe|msedge\.exe)$/;
    default: throw new Error(`Platform "${platform}" not supported`);
  }
})();
const browserCmdRegex = (() => {
  let chrome = '--enable-automation';
  let firefox = '-marionette';
  let edge = chrome;
  return new RegExp(`(${chrome}|${firefox}|${edge})`);
})();

async function getDefaults() {
  const { default: yn } = await import('yn');

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

function browserSwitch(name, {
  chrome,
  firefox,
  edge,
}) {
  switch (name) {
    case 'chrome': return chrome();
    case 'firefox': return firefox();
    case 'edge': return edge();
    default: throw new Error(`Browser "${name}" not implemented.`);
  }
}

function driverSwitch(name, {
  chrome,
  firefox,
  edge,
}) {
  switch (name) {
    case ChromeDriverName: return chrome();
    case FirefoxDriverName: return firefox();
    case EdgeDriverName: return edge();
    default: throw new Error(`Driver "${name}" not implemented.`);
  }
}

let events = new EventEmitter();

async function psList() {
  const { default: psList } = await import('ps-list');

  return psList.apply(this, arguments);
}

async function fkill() {
  const { default: fkill } = await import('fkill');

  return fkill.apply(this, arguments);
}

async function killOrphans() {
  await events.emit('kill-orphans-start');

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
    // This kills any other webdriver browsers that may be in use.
    // Checking the ppid is inconsistent across OSes.
    let isAlreadyOrphaned = browserCmdRegex.test(cmd);
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

  await events.emit('kill-orphans-end');
}

async function getNewPort(port) {
  if (!port || port === '0') {
    const { default: getPort } = await import('get-port');
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
  const { execa } = await import('execa');

  await module.exports.spawn(execa, name, ['--version']);

  let webDriver = module.exports.spawn(execa, name, args, {
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  async function waitForText(text) {
    await new Promise(resolve => {
      function wait(data) {
        if (data.toString().includes(text)) {
          resolve();

          webDriver.stdout.removeListener('data', wait);
        }
      }

      webDriver.stdout.on('data', wait);
    });
  }

  await driverSwitch(name, {
    async chrome() {
      await waitForText('ChromeDriver was started successfully');
    },
    async firefox() {
      await waitForText('Listening on 127.0.0.1');
    },
    async edge() {
      await waitForText('msedgedriver was started successfully');
    },
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

  // https://github.com/sindresorhus/execa/issues/173
  delete webDriver.then;
  delete webDriver.catch;

  return webDriver;
}

function startWebDriver(options = {}) {
  return log(async () => {
    const { default: yn } = await import('yn');

    if (!yn(process.env.WEBDRIVER_DISABLE_CLEANUP)) {
      await module.exports.killOrphans();
    }

    let { overrides = {} } = options;
    let _browser = overrides.browser || (await getDefaults()).browser;

    await module.exports._getNewPort(overrides.port);

    let driverName;
    let driverArgs;

    browserSwitch(_browser, {
      chrome() {
        driverName = ChromeDriverName;
        driverArgs = [`--port=${port}`];
      },
      firefox() {
        driverName = FirefoxDriverName;
        driverArgs = ['--port', port];
      },
      edge() {
        driverName = EdgeDriverName;
        driverArgs = [`--port=${port}`];
      },
    });

    let webDriver = await module.exports.spawnWebDriver(driverName, driverArgs);

    if (!yn(process.env.WEBDRIVER_DISABLE_CLEANUP)) {
      webDriver.once('exit', module.exports.killOrphans);
    }

    return webDriver;
  });
}

function stopWebDriver(webDriver) {
  return log(async () => {
    if (!webDriver) {
      return;
    }

    const { default: yn } = await import('yn');

    if (!yn(process.env.WEBDRIVER_DISABLE_CLEANUP)) {
      webDriver.removeListener('exit', killOrphans);
    }

    webDriver.kill();

    await new Promise(resolve => {
      webDriver.once('exit', resolve);
    });
  });
}

async function getCapabilities({
  customizeCapabilities = (browserName, capabilities) => capabilities,
  overrides: {
    browser: _browser,
  } = {},
}) {
  _browser ??= (await getDefaults()).browser;

  let capabilities = {
    browserName: _browser,
  };

  let headless = (await getDefaults()).headless;

  let browserCapabilities;

  browserSwitch(_browser, {
    chrome() {
      let args = [];
      if (headless) {
        args.push('--headless');
      }
      browserCapabilities = {
        args,
      };
      capabilities['goog:chromeOptions'] = browserCapabilities;
    },
    firefox() {
      let args = [];
      if (headless) {
        args.push('-headless');
      }
      browserCapabilities = {
        args,
      };
      capabilities['moz:firefoxOptions'] = browserCapabilities;
    },
    edge() {
      let args = [];
      if (headless) {
        args.push('--headless');
      }
      browserCapabilities = {
        args,
      };
      capabilities['ms:edgeOptions'] = browserCapabilities;

      capabilities.browserName = 'MicrosoftEdge';
    },
  });

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
        logLevel: overrides.logLevel || (await getDefaults()).logLevel,
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

    // eslint-disable-next-line node/no-extraneous-require
    let { DEFAULTS } = require('webdriver');

    browser.options.connectionRetryCount = DEFAULTS.connectionRetryCount.default;

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
module.exports._getNewPort = _getNewPort;
module.exports.spawnWebDriver = spawnWebDriver;
module.exports.spawn = spawn;
