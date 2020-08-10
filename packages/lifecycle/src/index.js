'use strict';

const webDriver = require('@faltest/remote');
const Browser = require('@faltest/browser');
const log = require('./log');
const EventEmitter = require('events');
const {
  defaults,
  event: {
    emit: _emit,
    on,
  },
} = require('@faltest/utils');
const mocha = require('@faltest/mocha');

const shareWebdriver = process.env.WEBDRIVER_SHARE_WEBDRIVER === 'true';
const keepBrowserOpen = process.env.WEBDRIVER_KEEP_BROWSER_OPEN === 'true';
const shareSession = process.env.WEBDRIVER_SHARE_SESSION === 'true';
const target = process.env.WEBDRIVER_TARGET;
const env = process.env.NODE_CONFIG_ENV;
const throttleNetwork = process.env.WEBDRIVER_THROTTLE_NETWORK === 'true';
const browserCount = parseInt(process.env.WEBDRIVER_BROWSERS) || defaults.browsers;
const failureArtifactsEnabled = process.env.WEBDRIVER_FAILURE_ARTIFACTS === 'true';
const failureArtifactsOutputDir = process.env.WEBDRIVER_FAILURE_ARTIFACTS_OUTPUT_DIR;
const defaultOverrides = {};

if (!shareWebdriver && keepBrowserOpen) {
  throw new Error('!shareWebdriver && keepBrowserOpen is undefined');
}
if (!keepBrowserOpen && shareSession) {
  throw new Error('!keepBrowserOpen && shareSession is undefined');
}

if (failureArtifactsEnabled && !failureArtifactsOutputDir) {
  throw new Error('You must supply a failure artifacts output dir.');
}

let events = new EventEmitter();

const emit = _emit.bind(null, events);

async function lifecycleEvent(name, context, options) {
  await emit(name, { context, options });
}

async function startWebDriver(options) {
  let instance = await webDriver.startWebDriver(options);

  await emit('start-web-driver', instance);

  return instance;
}

async function stopWebDriver(instance) {
  await webDriver.stopWebDriver(instance);

  await emit('stop-web-driver');
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
    await emit('start-browser', browsers[0]);
  }

  await emit('start-browsers', browsers);

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
    await emit('stop-browser');
  }

  await emit('stop-browsers');

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
  await lifecycleEvent('before-begin', this, options);

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
      }
    }
  }

  await lifecycleEvent('before-end', this, options);
}

async function setUpWebDriverBeforeEach(options) {
  await lifecycleEvent('before-each-begin', this, options);

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

  await lifecycleEvent('before-each-end', this, options);
}

async function setUpWebDriverAfterEach(options) {
  await lifecycleEvent('after-each-begin', this, options);

  if (options.throttleNetwork) {
    for (let browser of sharedBrowsers) {
      // eslint-disable-next-line faltest/no-browser-throttle
      await browser.throttleOff();
    }
  }

  if (this.currentTest.state === 'failed') {
    if (options.failureArtifactsEnabled) {
      await mocha.failureArtifacts.call(this, options.failureArtifactsOutputDir);
    }
  }

  await lifecycleEvent('after-each-end', this, options);
}

async function setUpWebDriverAfter(options) {
  await lifecycleEvent('after-begin', this, options);

  overridesUsed = options.overrides;

  await lifecycleEvent('after-end', this, options);
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
  this.timeout(60 * 1000);

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
    failureArtifactsEnabled,
    failureArtifactsOutputDir,
    ...options,
  };

  for (let [name, func] of [
    ['before', setUpWebDriverBefore],
    ['beforeEach', setUpWebDriverBeforeEach],
    ['afterEach', setUpWebDriverAfterEach],
    ['after', setUpWebDriverAfter],
  ]) {
    global[name](function() {
      return log(name, async () => {
        await func.call(this, options);
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

on(webDriver.events, 'kill-orphans-end', async () => {
  // prevent using stored objects with killed processes
  resetInternalState();

  await emit('reset-internal-state');
});

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
