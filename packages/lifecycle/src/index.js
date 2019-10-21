'use strict';

const webDriver = require('@faltest/remote');
const Browser = require('@faltest/browser');
const log = require('./log');
const EventEmitter = require('events');
const { defaults } = require('@faltest/utils');

const shareWebdriver = process.env.WEBDRIVER_SHARE_WEBDRIVER === 'true';
const keepBrowserOpen = process.env.WEBDRIVER_KEEP_BROWSER_OPEN === 'true';
const shareSession = process.env.WEBDRIVER_SHARE_SESSION === 'true';
const target = process.env.WEBDRIVER_TARGET;
const env = process.env.NODE_CONFIG_ENV;
const throttleNetwork = process.env.WEBDRIVER_THROTTLE_NETWORK === 'true';
const browserCount = parseInt(process.env.WEBDRIVER_BROWSERS) || defaults.browsers;

if (!shareWebdriver && keepBrowserOpen) {
  throw new Error('!shareWebdriver && keepBrowserOpen is undefined');
}
if (!keepBrowserOpen && shareSession) {
  throw new Error('!keepBrowserOpen && shareSession is undefined');
}

let events = new EventEmitter();

async function event(name, context, options) {
  let promises = [];

  events.emit(name, {
    context,
    promises,
    options,
  });

  await Promise.all(promises);
}

async function startWebDriver(options) {
  let instance = await webDriver.startWebDriver(options.overrides);

  events.emit('start-web-driver', instance);

  return instance;
}

async function stopWebDriver(instance) {
  await webDriver.stopWebDriver(instance);

  events.emit('stop-web-driver');
}

async function startBrowsers(options) {
  let { browsers: count = browserCount } = options.overrides;

  let browsers = await Promise.all(Array(count).fill().map(() => {
    return webDriver.startBrowser(options.overrides);
  }));

  browsers = browsers.map(options.browserOverride);

  // This can be removed in a major version.
  if (browsers.length === 1) {
    events.emit('start-browser', browsers[0]);
  }

  events.emit('start-browsers', browsers);

  return browsers;
}

let webDriverInstance;
let sharedBrowsers;
let loggedInRole;

async function stopBrowsers(browsers) {
  for (let browser of browsers) {
    await webDriver.stopBrowser(browser);
  }

  // This can be removed in a major version.
  if (browsers.length === 1) {
    events.emit('stop-browser');
  }

  events.emit('stop-browsers');
}

async function setUpWebDriverBefore(options) {
  await event('before-begin', this, options);

  if (options.shareWebdriver) {
    if (!webDriverInstance) {
      webDriverInstance = await startWebDriver(options);
    }

    if (options.keepBrowserOpen) {
      if (!sharedBrowsers) {
        sharedBrowsers = await startBrowsers(options);
      }

      this.browser = sharedBrowsers[0];
      this.browsers = sharedBrowsers;
      await event('init-context', this, options);

      if (options.shareSession) {
        if (loggedInRole && (!options.shouldLogIn || !this.role || !options.areRolesEqual(this.role, loggedInRole))) {
          for (let browser of sharedBrowsers) {
            this.browser = browser;
            await options.logOut.call(this, options);
          }
          loggedInRole = null;
        }

        if (options.shouldLogIn && !loggedInRole) {
          for (let browser of sharedBrowsers) {
            this.browser = browser;
            await options.logIn.call(this, options);
          }
          loggedInRole = this.role;
        }

        await event('init-session', this, options);
      }
    }
  }

  await event('before-end', this, options);
}

async function setUpWebDriverBeforeEach(options) {
  await event('before-each-begin', this, options);

  if (!options.keepBrowserOpen && sharedBrowsers) {
    await stopBrowsers(sharedBrowsers);
    loggedInRole = null;
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

  this.browser = sharedBrowsers[0];
  this.browsers = sharedBrowsers;
  await event('init-context', this, options);

  if (!options.shareSession) {
    if (loggedInRole) {
      for (let browser of sharedBrowsers) {
        this.browser = browser;
        await options.logOut.call(this, options);
      }
      loggedInRole = null;
    }

    if (options.shouldLogIn && !loggedInRole) {
      for (let browser of sharedBrowsers) {
        this.browser = browser;
        await options.logIn.call(this, options);
      }
      loggedInRole = this.role;
    }

    await event('init-session', this, options);
  }

  if (options.throttleNetwork) {
    for (let browser of sharedBrowsers) {
      // eslint-disable-next-line faltest/no-browser-throttle
      await browser.throttleOn();
    }
  }

  await event('before-each-end', this, options);
}

async function setUpWebDriverAfterEach(options) {
  await event('after-each-begin', this, options);

  if (options.throttleNetwork) {
    for (let browser of sharedBrowsers) {
      // eslint-disable-next-line faltest/no-browser-throttle
      await browser.throttleOff();
    }
  }

  await event('after-each-end', this, options);
}

async function setUpWebDriverAfter(options) {
  await event('after-begin', this, options);

  await event('after-end', this, options);
}

function browserOverride(browser) {
  return new Browser(browser);
}

function areRolesEqual(role1, role2) {
  let property1 = 'username';
  let property2 = 'email';

  let key;
  if (role1.has(property1) && role2.has(property1)) {
    key = property1;
  } else if (role1.has(property2) && role2.has(property2)) {
    key = property2;
  }

  if (!key) {
    throw new Error(`Checking the default role properties of "${property1}" and "${property2}" failed. Looks like you need to implement \`${areRolesEqual.name}\` yourself.`);
  }

  return role1.get(key) === role2.get(key);
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
    overrides: {},
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
}

webDriver.events.on('kill-orphans', () => {
  // prevent using stored objects with killed processes
  resetInternalState();

  events.emit('reset-internal-state');
});

module.exports.setUpWebDriver = setUpWebDriver;
module.exports.resetInternalState = resetInternalState;
module.exports.setUpWebDriverBefore = setUpWebDriverBefore;
module.exports.setUpWebDriverBeforeEach = setUpWebDriverBeforeEach;
module.exports.setUpWebDriverAfterEach = setUpWebDriverAfterEach;
module.exports.setUpWebDriverAfter = setUpWebDriverAfter;
module.exports.areRolesEqual = areRolesEqual;
module.exports.browserOverride = browserOverride;
module.exports.events = events;
