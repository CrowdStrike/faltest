'use strict';

const webDriver = require('@faltest/remote');
const Browser = require('@faltest/browser');
const log = require('./log');
const EventEmitter = require('events-async');
const {
  defaults,
} = require('@faltest/utils');

const shareWebdriver = process.env.WEBDRIVER_SHARE_WEBDRIVER === 'true';
const keepBrowserOpen = process.env.WEBDRIVER_KEEP_BROWSER_OPEN === 'true';
const shareSession = process.env.WEBDRIVER_SHARE_SESSION === 'true';
const target = process.env.WEBDRIVER_TARGET;
const env = process.env.NODE_CONFIG_ENV;
const throttleNetwork = process.env.WEBDRIVER_THROTTLE_NETWORK === 'true';
const browserCount = parseInt(process.env.WEBDRIVER_BROWSERS) || defaults.browsers;
const defaultOverrides = {};

if (!shareWebdriver && keepBrowserOpen) {
  throw new Error('!shareWebdriver && keepBrowserOpen is undefined');
}
if (!keepBrowserOpen && shareSession) {
  throw new Error('!keepBrowserOpen && shareSession is undefined');
}

let events = new EventEmitter();

async function lifecycleEvent(name, context, options) {
  await events.emit(name, { context, options });
}

async function startWebDriver(options) {
  let instance = await webDriver.startWebDriver(options);

  await events.emit('start-web-driver', instance);

  return instance;
}

async function stopWebDriver(instance) {
  await webDriver.stopWebDriver(instance);

  await events.emit('stop-web-driver');
}

async function startBrowsers(options) {
  let { browsers: count = browserCount } = options.overrides;

  let browsers = await Promise.all(Array(count).fill().map(() => {
    return webDriver.startBrowser(options);
  }));

  browsers = browsers.map(options.browserOverride);
  browserOverrideUsed = options.browserOverride;

  // This can be removed in a major version.
  if (browsers.length === 1) {
    await events.emit('start-browser', browsers[0]);
  }

  await events.emit('start-browsers', browsers);

  return browsers;
}

let webDriverInstance;
let sharedBrowsers;
let contextAlreadyInit;
let sessionError;
let loggedInRole;
let browserOverrideUsed;
let overridesUsed;

async function stopBrowsers(browsers) {
  for (let browser of browsers) {
    await webDriver.stopBrowser(browser);
  }

  // This can be removed in a major version.
  if (browsers.length === 1) {
    await events.emit('stop-browser');
  }

  await events.emit('stop-browsers');

  loggedInRole = null;
}

async function logIn(options) {
  for (let browser of sharedBrowsers) {
    try {
      this.browser = browser;
      await options.logIn.call(this, options);
    } catch (err) {
      sessionError = true;

      throw err;
    }
  }

  loggedInRole = this.role;
}

async function logOut(options) {
  for (let browser of sharedBrowsers) {
    try {
      this.browser = browser;
      await options.logOut.call(this, options);
    } catch (err) {
      sessionError = true;

      throw err;
    }
  }

  loggedInRole = null;
}

async function initContext(options) {
  this.browser = sharedBrowsers[0];
  this.browsers = sharedBrowsers;
  this.faltestOptions = options;
  await lifecycleEvent('init-context', this, options);
}

async function setUpWebDriverBefore(options) {
  if (options.shareWebdriver) {
    if (webDriverInstance && (overridesUsed && overridesUsed !== options.overrides)) {
      await stopWebDriver(webDriverInstance);
      webDriverInstance = null;
    }

    if (!webDriverInstance) {
      webDriverInstance = await startWebDriver(options);
    }

    if (options.keepBrowserOpen) {
      if (sharedBrowsers && (browserOverrideUsed !== options.browserOverride || (overridesUsed && overridesUsed !== options.overrides))) {
        await stopBrowsers(sharedBrowsers);
        sharedBrowsers = null;
      }

      if (!sharedBrowsers) {
        sharedBrowsers = await startBrowsers(options);
      }

      await initContext.call(this, options);
      contextAlreadyInit = true;

      if (options.shareSession) {
        if (loggedInRole && (!options.shouldLogIn || !this.role || !options.areRolesEqual(this.role, loggedInRole))) {
          await logOut.call(this, options);
        }

        if (options.shouldLogIn && !loggedInRole) {
          await logIn.call(this, options);
        }

        await lifecycleEvent('init-session', this, options);
        sessionError = false;
      }
    }
  }
}

async function setUpWebDriverBeforeEach(options) {
  if (!options.keepBrowserOpen && sharedBrowsers) {
    await stopBrowsers(sharedBrowsers);
  }

  if (!options.shareWebdriver) {
    if (webDriverInstance) {
      await stopWebDriver(webDriverInstance);
    }

    webDriverInstance = await startWebDriver(options);
  }

  if (!options.keepBrowserOpen) {
    sharedBrowsers = await startBrowsers(options);
  }

  if (!contextAlreadyInit) {
    await initContext.call(this, options);
  }
  contextAlreadyInit = false;

  if (!options.shareSession || sessionError) {
    if (loggedInRole) {
      await logOut.call(this, options);
    }

    if (options.shouldLogIn && !loggedInRole) {
      await logIn.call(this, options);
    }

    await lifecycleEvent('init-session', this, options);
    sessionError = false;
  }

  if (options.throttleNetwork) {
    for (let browser of sharedBrowsers) {
      // eslint-disable-next-line faltest/no-browser-throttle
      await browser.throttleOn();
    }
  }
}

async function setUpWebDriverAfterEach(options) {
  if (options.throttleNetwork) {
    for (let browser of sharedBrowsers) {
      // eslint-disable-next-line faltest/no-browser-throttle
      await browser.throttleOff();
    }
  }
}

function setUpWebDriverAfter(options) {
  overridesUsed = options.overrides;
}

function browserOverride(browser) {
  return new Browser(browser);
}

function areRolesEqual(role1, role2) {
  let property1 = 'username';
  let property2 = 'email';

  let key;
  if (property1 in role1 && property1 in role2) {
    key = property1;
  } else if (property2 in role1 && property2 in role2) {
    key = property2;
  }

  if (!key) {
    throw new Error(`Checking the default role properties of "${property1}" and "${property2}" failed. Looks like you need to implement \`${areRolesEqual.name}\` yourself.`);
  }

  return role1[key] === role2[key];
}

function setUpWebDriver(options) {
  options = {
    shareWebdriver,
    keepBrowserOpen,
    shareSession,
    shouldLogIn: true,
    areRolesEqual,
    logIn() {},
    logOut() {},
    target,
    env,
    throttleNetwork,
    browserOverride,
    overrides: defaultOverrides,
    mocha: global,
    timeout: 60e3,
    ...options,
  };

  this.timeout(options.timeout);

  for (let [name, func, event] of [
    ['before', setUpWebDriverBefore, 'before'],
    ['beforeEach', setUpWebDriverBeforeEach, 'before-each'],
    ['afterEach', setUpWebDriverAfterEach, 'after-each'],
    ['after', setUpWebDriverAfter, 'after'],
  ]) {
    options.mocha[name](function() {
      return log(name, async () => {
        await lifecycleEvent(`${event}-begin`, this, options);

        // This used to only be in `setUpWebDriverAfterEach`, but it was
        // not triggered if the error happened in `beforeEach` instead of `it`,
        // so it needs to be called at the beginning of `setUpWebDriverBeforeEach` too.
        // Therefore, I don't think it would hurt to do it in all cases.
        await waitForPromisesToFlushBetweenTests();

        await func.call(this, options);

        await lifecycleEvent(`${event}-end`, this, options);
      });
    });
  }
}

function resetInternalState() {
  webDriverInstance = null;
  sharedBrowsers = null;
  loggedInRole = null;
  browserOverrideUsed = null;
  overridesUsed = null;
}

webDriver.events.on('kill-orphans-end', async () => {
  // prevent using stored objects with killed processes
  resetInternalState();

  await events.emit('reset-internal-state');
});

async function waitForPromisesToFlushBetweenTests() {
  if (global.promisesToFlushBetweenTests) {
    try {
      await Promise.all(global.promisesToFlushBetweenTests);
    } catch (err) {
      // This will be handled by the source.
    }
  }
}

module.exports = {
  setUpWebDriver,
  resetInternalState,
  setUpWebDriverBefore,
  setUpWebDriverBeforeEach,
  setUpWebDriverAfterEach,
  setUpWebDriverAfter,
  areRolesEqual,
  browserOverride,
  events,
};
