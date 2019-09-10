'use strict';

const { spawn } = require('child_process');
const {
  exec,
  findBin,
} = require('./cp');
const { remote } = require('webdriverio');
const psList = require('ps-list');
const fkill = require('fkill');
const getPort = require('get-port');
const debug = require('./debug');
const log = require('./log');
const {
  getMajorVersion: getMajorChromeVersion,
} = require('./chrome');
const EventEmitter = require('events');
// const config = require('config');

// We aren't using `@wdio/cli` (wdio testrunner)
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';

// const browser = config.get('browser');
// const headless = config.get('headless') === 'true';

const browser = process.env.WEBDRIVER_BROWSER;
const headless = process.env.WEBDRIVER_HEADLESS === 'true';

let port;

const webDriverRegex = /^(chromedriver|geckodriver)$/;
const browserNameRegex = (() => {
  let linux = 'chrome';
  let mac = 'Google Chrome|firefox-bin';
  return new RegExp(`^(${linux}|${mac})$`);
})();
const browserCmdRegex = (() => {
  let chrome = '--enable-automation';
  let firefox = '-marionette';
  return new RegExp(`(${chrome}|${firefox})`);
})();

const logLevel = debug.verbose.enabled ? 'trace' : debug.enabled ? 'warn' : 'silent';

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
      await module.exports.fkill(orphan.pid);
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

async function spawnWebDriver(execPath, args) {
  let versionCommand = `${execPath} --version`;
  await exec(versionCommand);

  let webDriver = spawn(execPath, args, {
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  // webDriver.stdout.pipe(process.stdout);

  return webDriver;
}

function startWebDriver(overrides = {}) {
  return log(async () => {
    await killOrphans();

    let _browser = overrides.browser || browser;

    await _getNewPort(overrides.port);

    let webDriver;
    switch (_browser) {
      case 'chrome': {
        let pkgName;
        if (await getMajorChromeVersion() === '65') {
          pkgName = 'chromedriver_v65';
        } else {
          pkgName = 'chromedriver';
        }
        debug(pkgName);
        webDriver = await spawnWebDriver(await findBin(pkgName, 'chromedriver'), [`--port=${port}`]);
        break;
      }
      case 'firefox':
        webDriver = await spawnWebDriver(await findBin('geckodriver'), ['--port', port]);
        break;
    }

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

function getCapabilities({
  browser: _browser = browser,
}) {
  let capabilities = {
    browserName: _browser,
  };

  switch (_browser) {
    case 'chrome': {
      let args = [];
      if (headless) {
        args.push('--headless');
      }
      capabilities['goog:chromeOptions'] = {
        args,
      };
      break;
    }
    case 'firefox': {
      let args = [];
      if (headless) {
        args.push('-headless');
      }
      capabilities['moz:firefoxOptions'] = {
        args,
      };
      break;
    }
  }

  return capabilities;
}

function startBrowser(overrides = {}) {
  return log(async () => {
    let browser;
    let connectionRetryCount = 50;

    try {
      // We should refrain from using the `baseUrl` option here
      // because subdomain can change as you navigate your app
      browser = await remote({
        logLevel: overrides.logLevel || logLevel,
        path: '/',
        port: parseInt(port),
        capabilities: getCapabilities(overrides),
        waitforTimeout: overrides.waitforTimeout !== undefined ? overrides.waitforTimeout : 30 * 1000,

        // this is only needed for geckodriver because
        // it takes a while to boot up and doesn't notify
        // you via console output
        // `connectionRetryTimeout` would be a better option,
        // but it doesn't work (unimplemented)
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

    await browser.close();
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
