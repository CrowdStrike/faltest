'use strict';

const webDriver = require('@faltest/remote');
const Browser = require('@faltest/browser');
const log = require('./log');
const EventEmitter = require('events');

const shareWebdriver = process.env.WEBDRIVER_SHARE_WEBDRIVER === 'true';
const keepBrowserOpen = process.env.WEBDRIVER_KEEP_BROWSER_OPEN === 'true';
const shareSession = process.env.WEBDRIVER_SHARE_SESSION === 'true';
const target = process.env.WEBDRIVER_TARGET;
const env = process.env.NODE_CONFIG_ENV;
const throttleNetwork = process.env.WEBDRIVER_THROTTLE_NETWORK === 'true';

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

let webDriverInstance;
let sharedBrowser;
let loggedInRole;

async function setUpWebDriverBefore(options) {
  await event('before-begin', this, options);

  if (options.shareWebdriver) {
    if (!webDriverInstance) {
      webDriverInstance = await webDriver.startWebDriver(options.overrides);
      events.emit('start-web-driver', webDriverInstance);
    }

    if (options.keepBrowserOpen) {
      if (!sharedBrowser) {
        sharedBrowser = await webDriver.startBrowser(options.overrides);
        sharedBrowser = options.browserOverride(sharedBrowser);
        events.emit('start-browser', sharedBrowser);
      }

      this.browser = sharedBrowser;
      await event('init-context', this, options);

      if (options.shareSession) {
        if (loggedInRole && (!options.shouldLogIn || !this.role || !options.areRolesEqual(this.role, loggedInRole))) {
          await options.logOut.call(this, options);
          loggedInRole = null;
        }

        if (options.shouldLogIn && !loggedInRole) {
          await options.logIn.call(this, options);
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

  if (!options.keepBrowserOpen && sharedBrowser) {
    await webDriver.stopBrowser(sharedBrowser);
    loggedInRole = null;
    events.emit('stop-browser');
  }

  if (!options.shareWebdriver) {
    if (webDriverInstance) {
      await webDriver.stopWebDriver(webDriverInstance);
      events.emit('stop-web-driver');
    }

    webDriverInstance = await webDriver.startWebDriver(options.overrides);
    events.emit('start-web-driver', webDriverInstance);
  }

  if (!options.keepBrowserOpen) {
    sharedBrowser = await webDriver.startBrowser(options.overrides);
    sharedBrowser = options.browserOverride(sharedBrowser);
    events.emit('start-browser', sharedBrowser);
  }

  this.browser = sharedBrowser;
  await event('init-context', this, options);

  if (!options.shareSession) {
    if (loggedInRole) {
      await options.logOut.call(this, options);
      loggedInRole = null;
    }

    if (options.shouldLogIn && !loggedInRole) {
      await options.logIn.call(this, options);
      loggedInRole = this.role;
    }

    await event('init-session', this, options);
  }

  if (options.throttleNetwork) {
    // eslint-disable-next-line faltest/no-browser-throttle
    await this.browser.throttleOn();
  }

  await event('before-each-end', this, options);
}

async function setUpWebDriverAfterEach(options) {
  await event('after-each-begin', this, options);

  if (options.throttleNetwork) {
    // eslint-disable-next-line faltest/no-browser-throttle
    await this.browser.throttleOff();
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
  sharedBrowser = null;
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
