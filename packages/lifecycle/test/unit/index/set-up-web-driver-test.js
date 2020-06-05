'use strict';

const { describe, it } = require('../../../../../helpers/mocha');
const { expect } = require('../../../../../helpers/chai');
const webDriver = require('@faltest/remote');
const Browser = require('@faltest/browser');
const sinon = require('sinon');
const mocha = require('../../../src');
const { event: { emit, on } } = require('../../../../utils');

const {
  setUpWebDriver,
  resetInternalState,
  setUpWebDriverBefore,
  setUpWebDriverBeforeEach,
  setUpWebDriverAfterEach,
  setUpWebDriverAfter,
  areRolesEqual,
  browserOverride,
  events,
} = mocha;

describe(setUpWebDriver, function() {
  let webDriverInstance;
  let sharedBrowser;

  let startWebDriver;
  let stopWebDriver;
  let startBrowser;
  let stopBrowser;
  let logIn;
  let logOut;

  let onStartWebDriver;
  let onStopWebDriver;
  let onStartBrowser;
  let onStartBrowsers;
  let onStopBrowser;
  let onStopBrowsers;
  let onInitContext;
  let onInitSession;

  let onBeforeBegin;
  let onBeforeEnd;
  let onBeforeEachBegin;
  let onBeforeEachEnd;
  let onAfterEachBegin;
  let onAfterEachEnd;
  let onAfterBegin;
  let onAfterEnd;

  let onResetInternalState;
  let browserOverrideSpy;

  let role;
  let context;
  let options;

  function resetContext() {
    context = {
      role,
    };
  }

  beforeEach(function() {
    webDriverInstance = {};
    sharedBrowser = {};

    role = {};

    resetContext();

    options = {};

    startWebDriver = sinon.stub(webDriver, 'startWebDriver')
      .withArgs(options)
      .resolves(webDriverInstance);
    stopWebDriver = sinon.stub(webDriver, 'stopWebDriver')
      .withArgs(webDriverInstance)
      .resolves();
    startBrowser = sinon.stub(webDriver, 'startBrowser')
      .withArgs(options)
      .resolves(sharedBrowser);
    stopBrowser = sinon.stub(webDriver, 'stopBrowser')
      .withArgs(sinon.match({ _browser: sharedBrowser }))
      .resolves();
    // eslint-disable-next-line require-await
    logIn = sinon.stub().withArgs(options).callsFake(async function() {
      // because there is no `withArgs` equivalent for `this`
      expect(this).to.equal(context);
      expect(this.browser).to.equal(this.browsers[logIn.callCount - 1]);
    });
    // eslint-disable-next-line require-await
    logOut = sinon.stub().withArgs(options).callsFake(async function() {
      // because there is no `withArgs` equivalent for `this`
      expect(this).to.equal(context);
      expect(this.browser).to.equal(this.browsers[logOut.callCount - 1]);
    });

    browserOverrideSpy = sinon.spy(browserOverride);

    onStartWebDriver = sinon.spy();
    onStopWebDriver = sinon.spy();
    onStartBrowser = sinon.spy();
    onStartBrowsers = sinon.spy();
    onStopBrowser = sinon.spy();
    onStopBrowsers = sinon.spy();
    onInitContext = sinon.spy();
    onInitSession = sinon.spy();

    onBeforeBegin = sinon.spy();
    onBeforeEnd = sinon.spy();
    onBeforeEachBegin = sinon.spy();
    onBeforeEachEnd = sinon.spy();
    onAfterEachBegin = sinon.spy();
    onAfterEachEnd = sinon.spy();
    onAfterBegin = sinon.spy();
    onAfterEnd = sinon.spy();

    onResetInternalState = sinon.spy();

    onStartWebDriver = onStartWebDriver.withArgs(webDriverInstance);
    onStartBrowser = onStartBrowser.withArgs(sinon.match(value => {
      return value === browserOverrideSpy.getCall(0).returnValue;
    }));
    onStartBrowsers = onStartBrowsers.withArgs(sinon.match(value => {
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== browserOverrideSpy.getCall(i).returnValue) {
          return false;
        }
      }
      return true;
    }));

    Object.assign(options, {
      logIn,
      logOut,
      browserOverride: browserOverrideSpy,
      overrides: {},
    });

    let event = sinon.match({
      context,
      promises: sinon.match.array,
      options,
    });

    onInitContext = onInitContext.withArgs(event);
    onInitSession = onInitSession.withArgs(event);
    onBeforeBegin = onBeforeBegin.withArgs(event);
    onBeforeEnd = onBeforeEnd.withArgs(event);
    onBeforeEachBegin = onBeforeEachBegin.withArgs(event);
    onBeforeEachEnd = onBeforeEachEnd.withArgs(event);
    onAfterEachBegin = onAfterEachBegin.withArgs(event);
    onAfterEachEnd = onAfterEachEnd.withArgs(event);
    onAfterBegin = onAfterBegin.withArgs(event);
    onAfterEnd = onAfterEnd.withArgs(event);

    on(events, 'start-web-driver', onStartWebDriver);
    on(events, 'stop-web-driver', onStopWebDriver);
    on(events, 'start-browser', onStartBrowser);
    on(events, 'start-browsers', onStartBrowsers);
    on(events, 'stop-browser', onStopBrowser);
    on(events, 'stop-browsers', onStopBrowsers);
    on(events, 'init-context', onInitContext);
    on(events, 'init-session', onInitSession);

    on(events, 'before-begin', onBeforeBegin);
    on(events, 'before-end', onBeforeEnd);
    on(events, 'before-each-begin', onBeforeEachBegin);
    on(events, 'before-each-end', onBeforeEachEnd);
    on(events, 'after-each-begin', onAfterEachBegin);
    on(events, 'after-each-end', onAfterEachEnd);
    on(events, 'after-begin', onAfterBegin);
    on(events, 'after-end', onAfterEnd);

    on(events, 'reset-internal-state', onResetInternalState);

    resetInternalState();
  });

  afterEach(function() {
    events.removeListener('start-web-driver', onStartWebDriver);
    events.removeListener('stop-web-driver', onStopWebDriver);
    events.removeListener('start-browser', onStartBrowser);
    events.removeListener('start-browsers', onStartBrowsers);
    events.removeListener('stop-browser', onStopBrowser);
    events.removeListener('stop-browsers', onStopBrowsers);
    events.removeListener('init-context', onInitContext);
    events.removeListener('init-session', onInitSession);

    events.removeListener('before-begin', onBeforeBegin);
    events.removeListener('before-end', onBeforeEnd);
    events.removeListener('before-each-begin', onBeforeEachBegin);
    events.removeListener('before-each-end', onBeforeEachEnd);
    events.removeListener('after-each-begin', onAfterEachBegin);
    events.removeListener('after-each-end', onAfterEachEnd);
    events.removeListener('after-begin', onAfterBegin);
    events.removeListener('after-end', onAfterEnd);

    events.removeListener('reset-internal-state', onResetInternalState);

    sinon.restore();
  });

  after(function() {
    resetInternalState();
  });

  function setOptions(_options) {
    Object.assign(options, _options);
  }

  async function beforeTest() {
    resetContext();

    await setUpWebDriverBefore.call(context, options);
    await eachTest();
  }

  async function eachTest() {
    await setUpWebDriverBeforeEach.call(context, options);
    await setUpWebDriverAfterEach.call(context, options);
  }

  async function afterTest() {
    await eachTest();
    await setUpWebDriverAfter.call(context, options);
  }

  function assertLifecycleBefore() {
    expect(onBeforeBegin).to.have.callCount(1);
    expect(onBeforeEnd).to.have.callCount(1);
    expect(onBeforeEachBegin).to.have.callCount(1);
    expect(onBeforeEachEnd).to.have.callCount(1);
    expect(onAfterEachBegin).to.have.callCount(1);
    expect(onAfterEachEnd).to.have.callCount(1);
    expect(onAfterBegin).to.have.callCount(0);
    expect(onAfterEnd).to.have.callCount(0);

    expect(onBeforeEnd).to.have.been.calledAfter(onBeforeBegin);
    expect(onBeforeEachBegin).to.have.been.calledAfter(onBeforeEnd);
    expect(onBeforeEachEnd).to.have.been.calledAfter(onBeforeEachBegin);
    expect(onAfterEachBegin).to.have.been.calledAfter(onBeforeEachEnd);
    expect(onAfterEachEnd).to.have.been.calledAfter(onAfterEachBegin);
  }

  function assertLifecycleBeforeError() {
    expect(onBeforeBegin).to.have.callCount(1);
    expect(onBeforeEnd).to.have.callCount(0);
    expect(onBeforeEachBegin).to.have.callCount(0);
    expect(onBeforeEachEnd).to.have.callCount(0);
    expect(onAfterEachBegin).to.have.callCount(0);
    expect(onAfterEachEnd).to.have.callCount(0);
    expect(onAfterBegin).to.have.callCount(0);
    expect(onAfterEnd).to.have.callCount(0);
  }

  function assertLifecycleEach() {
    expect(onBeforeBegin).to.have.callCount(0);
    expect(onBeforeEnd).to.have.callCount(0);
    expect(onBeforeEachBegin).to.have.callCount(1);
    expect(onBeforeEachEnd).to.have.callCount(1);
    expect(onAfterEachBegin).to.have.callCount(1);
    expect(onAfterEachEnd).to.have.callCount(1);
    expect(onAfterBegin).to.have.callCount(0);
    expect(onAfterEnd).to.have.callCount(0);

    expect(onBeforeEachEnd).to.have.been.calledAfter(onBeforeEachBegin);
    expect(onAfterEachBegin).to.have.been.calledAfter(onBeforeEachEnd);
    expect(onAfterEachEnd).to.have.been.calledAfter(onAfterEachBegin);
  }

  function assertLifecycleAfter() {
    expect(onBeforeBegin).to.have.callCount(0);
    expect(onBeforeEnd).to.have.callCount(0);
    expect(onBeforeEachBegin).to.have.callCount(1);
    expect(onBeforeEachEnd).to.have.callCount(1);
    expect(onAfterEachBegin).to.have.callCount(1);
    expect(onAfterEachEnd).to.have.callCount(1);
    expect(onAfterBegin).to.have.callCount(1);
    expect(onAfterEnd).to.have.callCount(1);

    expect(onBeforeEachEnd).to.have.been.calledAfter(onBeforeEachBegin);
    expect(onAfterEachBegin).to.have.been.calledAfter(onBeforeEachEnd);
    expect(onAfterEachEnd).to.have.been.calledAfter(onAfterEachBegin);
    expect(onAfterBegin).to.have.been.calledAfter(onAfterEachEnd);
    expect(onAfterEnd).to.have.been.calledAfter(onAfterBegin);
  }

  function assertContext() {
    expect(context.browser).to.be.an.instanceof(Browser);
    expect(context.browsers).to.be.an('array');
    for (let browser of context.browsers) {
      expect(browser).to.be.an.instanceof(Browser);
    }
  }

  function reset() {
    for (let stub of [
      startWebDriver,
      stopWebDriver,
      startBrowser,
      stopBrowser,
      logIn,
      logOut,

      onStartWebDriver,
      onStopWebDriver,
      onStartBrowser,
      onStartBrowsers,
      onStopBrowser,
      onStopBrowsers,
      onInitContext,
      onInitSession,

      onBeforeBegin,
      onBeforeEnd,
      onBeforeEachBegin,
      onBeforeEachEnd,
      onAfterEachBegin,
      onAfterEachEnd,
      onAfterBegin,
      onAfterEnd,

      onResetInternalState,
      browserOverrideSpy,
    ]) {
      stub.resetHistory();
    }
  }

  describe('don\'t share web driver', function() {
    beforeEach(function() {
      setOptions({
        shareWebdriver: false,
        keepBrowserOpen: false,
        shareSession: false,
      });
    });

    it('log in', async function() {
      setOptions({
        shouldLogIn: true,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();

      reset();

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();
    });

    it('don\'t log in', async function() {
      setOptions({
        shouldLogIn: false,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();

      reset();

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();
    });

    it('log in and don\'t log in', async function() {
      setOptions({
        shouldLogIn: true,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();

      reset();

      setOptions({
        shouldLogIn: false,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);

      expect(stopWebDriver).to.have.been.calledAfter(stopBrowser);
      expect(startWebDriver).to.have.been.calledAfter(stopWebDriver);
      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(1);

      expect(onStopWebDriver).to.have.been.calledAfter(onStopBrowser);
      expect(onStartWebDriver).to.have.been.calledAfter(onStopWebDriver);
      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();
    });
  });

  describe('share web driver', function() {
    beforeEach(function() {
      setOptions({
        shareWebdriver: true,
        keepBrowserOpen: false,
        shareSession: false,
      });
    });

    it('log in', async function() {
      setOptions({
        shouldLogIn: true,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();

      reset();

      await beforeTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();
    });

    it('don\'t log in', async function() {
      setOptions({
        shouldLogIn: false,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();

      reset();

      await beforeTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();
    });

    it('log in and don\'t log in', async function() {
      setOptions({
        shouldLogIn: true,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();

      reset();

      setOptions({
        shouldLogIn: false,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(stopBrowser);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(1);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStopBrowser);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();
    });
  });

  describe('keep browser open', function() {
    beforeEach(function() {
      setOptions({
        shareWebdriver: true,
        keepBrowserOpen: true,
        shareSession: false,
      });
    });

    it('log in', async function() {
      setOptions({
        shouldLogIn: true,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(1);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(logIn).to.have.been.calledAfter(logOut);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(1);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(logIn).to.have.been.calledAfter(logOut);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();

      reset();

      await beforeTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(1);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(logIn).to.have.been.calledAfter(logOut);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(1);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(logIn).to.have.been.calledAfter(logOut);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(1);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(logIn).to.have.been.calledAfter(logOut);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();
    });

    it('don\'t log in', async function() {
      setOptions({
        shouldLogIn: false,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();

      reset();

      await beforeTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();
    });

    it('log in and don\'t log in', async function() {
      setOptions({
        shouldLogIn: true,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(1);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(logIn).to.have.been.calledAfter(logOut);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(1);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(logIn).to.have.been.calledAfter(logOut);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();

      reset();

      setOptions({
        shouldLogIn: false,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(1);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleAfter();

      assertContext();
    });
  });

  describe('share session', function() {
    beforeEach(function() {
      setOptions({
        shareWebdriver: true,
        keepBrowserOpen: true,
        shareSession: true,
      });
    });

    it('log in', async function() {
      setOptions({
        shouldLogIn: true,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleAfter();

      assertContext();

      reset();

      let loggedInRole = role;
      role = {};

      let areRolesEqual = sinon.stub().withArgs(role, loggedInRole).returns(true);

      setOptions({
        areRolesEqual,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(areRolesEqual).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      setOptions({
        areRolesEqual: null,
      });

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleAfter();

      assertContext();
    });

    it('don\'t log in', async function() {
      setOptions({
        shouldLogIn: false,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleAfter();

      assertContext();

      reset();

      await beforeTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleAfter();

      assertContext();
    });

    it('log in and don\'t log in', async function() {
      setOptions({
        shouldLogIn: true,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowser).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowser).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowser);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleAfter();

      assertContext();

      reset();

      setOptions({
        shouldLogIn: false,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(1);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleAfter();

      assertContext();
    });

    it('logs out if role switches', async function() {
      setOptions({
        shouldLogIn: true,
      });

      await beforeTest();

      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);

      reset();

      let loggedInRole = role;
      role = {};

      let areRolesEqual = sinon.stub().withArgs(role, loggedInRole).returns(false);

      setOptions({
        areRolesEqual,
      });

      await beforeTest();

      expect(areRolesEqual).to.have.callCount(1);
      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(1);

      expect(logOut).to.have.been.calledAfter(areRolesEqual);
      expect(logIn).to.have.been.calledAfter(logOut);
    });

    it('logs out if switching between role and no role', async function() {
      setOptions({
        shouldLogIn: true,
      });

      await beforeTest();

      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);

      reset();

      role = null;

      setOptions({
        shouldLogIn: false,
      });

      await beforeTest();

      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(1);
    });

    it('doesn\'t share session if login failure', async function() {
      setOptions({
        shouldLogIn: true,
      });

      options.logIn = sinon.stub().rejects(new Error('test login error'));

      await expect(beforeTest()).to.eventually.be.rejectedWith('test login error');

      expect(options.logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);

      expect(onInitSession).to.have.callCount(0);

      assertLifecycleBeforeError();

      assertContext();

      reset();

      options.logIn = logIn;

      await eachTest();

      expect(logIn).to.have.callCount(1);
      expect(logOut).to.have.callCount(0);

      expect(onInitSession).to.have.callCount(1);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);

      expect(onInitSession).to.have.callCount(0);

      assertLifecycleAfter();

      assertContext();
    });
  });

  describe('throttle network', function() {
    it('does nothing', async function() {
      setOptions({
        browserOverride: browser => browser,
        throttleNetwork: false,
      });

      let throttleOn = sinon.stub().resolves();
      let throttleOff = sinon.stub().resolves();

      sharedBrowser.throttleOn = throttleOn;
      sharedBrowser.throttleOff = throttleOff;

      await beforeTest();

      expect(throttleOn).to.have.callCount(0);
      expect(throttleOff).to.have.callCount(0);

      await eachTest();

      expect(throttleOn).to.have.callCount(0);
      expect(throttleOff).to.have.callCount(0);

      await afterTest();

      expect(throttleOn).to.have.callCount(0);
      expect(throttleOff).to.have.callCount(0);
    });

    it('turns on and off', async function() {
      setOptions({
        browserOverride: browser => browser,
        throttleNetwork: true,
      });

      let throttleOn = sinon.stub().resolves();
      let throttleOff = sinon.stub().resolves();

      sharedBrowser.throttleOn = throttleOn;
      sharedBrowser.throttleOff = throttleOff;

      await beforeTest();

      expect(throttleOn).to.have.callCount(1);
      expect(throttleOff).to.have.callCount(1);

      expect(throttleOff).to.have.been.calledAfter(throttleOn);

      throttleOn.resetHistory();
      throttleOff.resetHistory();

      await eachTest();

      expect(throttleOn).to.have.callCount(1);
      expect(throttleOff).to.have.callCount(1);

      expect(throttleOff).to.have.been.calledAfter(throttleOn);

      throttleOn.resetHistory();
      throttleOff.resetHistory();

      await afterTest();

      expect(throttleOn).to.have.callCount(1);
      expect(throttleOff).to.have.callCount(1);

      expect(throttleOff).to.have.been.calledAfter(throttleOn);
    });
  });

  describe(browserOverride, function() {
    it('doesn\'t reuse browser if override changes', async function() {
      setOptions({
        shareWebdriver: true,
        keepBrowserOpen: true,
      });

      await beforeTest();

      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(1);
      expect(stopBrowser).to.have.callCount(0);

      let oldBrowser = context.browser;

      reset();

      setOptions({
        browserOverride: browser => browser,
      });

      await beforeTest();

      expect(startBrowser).to.have.callCount(1);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(1);

      expect(context.browser).to.not.equal(oldBrowser);
    });
  });

  describe('overrides', function() {
    it('doesn\'t reuse web driver or browser if overrides change', async function() {
      setOptions({
        shareWebdriver: true,
        keepBrowserOpen: true,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      await afterTest();

      reset();

      setOptions({
        overrides: {},
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(1);
      expect(stopBrowser).to.have.callCount(1);
      expect(stopWebDriver).to.have.callCount(1);
    });
  });

  it('resets internal state on kill orphans', async function() {
    await emit(webDriver.events, 'kill-orphans');

    expect(onResetInternalState).to.have.callCount(1);
  });

  describe(areRolesEqual, function() {
    it('same email', function() {
      let has = sinon.stub();
      has.withArgs('email').returns(true);
      has.withArgs('username').returns(false);
      let get1 = sinon.stub().withArgs('email').returns('foo@bar.baz');
      let get2 = sinon.stub().withArgs('email').returns('foo@bar.baz');

      let role1 = {
        has,
        get: get1,
      };
      let role2 = {
        has,
        get: get2,
      };

      let result = areRolesEqual(role1, role2);

      expect(result).to.be.true;

      expect(get1).to.have.callCount(1);
      expect(get2).to.have.callCount(1);
    });

    it('different email', function() {
      let has = sinon.stub();
      has.withArgs('email').returns(true);
      has.withArgs('username').returns(false);
      let get1 = sinon.stub().withArgs('email').returns('foo1@bar.baz');
      let get2 = sinon.stub().withArgs('email').returns('foo2@bar.baz');

      let role1 = {
        has,
        get: get1,
      };
      let role2 = {
        has,
        get: get2,
      };

      let result = areRolesEqual(role1, role2);

      expect(result).to.be.false;

      expect(get1).to.have.callCount(1);
      expect(get2).to.have.callCount(1);
    });

    it('same username', function() {
      let has = sinon.stub();
      has.withArgs('email').returns(false);
      has.withArgs('username').returns(true);
      let get1 = sinon.stub().withArgs('username').returns('foo');
      let get2 = sinon.stub().withArgs('username').returns('foo');

      let role1 = {
        has,
        get: get1,
      };
      let role2 = {
        has,
        get: get2,
      };

      let result = areRolesEqual(role1, role2);

      expect(result).to.be.true;

      expect(get1).to.have.callCount(1);
      expect(get2).to.have.callCount(1);
    });

    it('different username', function() {
      let has = sinon.stub();
      has.withArgs('email').returns(true);
      has.withArgs('username').returns(false);
      let get1 = sinon.stub().withArgs('username').returns('foo1');
      let get2 = sinon.stub().withArgs('username').returns('foo2');

      let role1 = {
        has,
        get: get1,
      };
      let role2 = {
        has,
        get: get2,
      };

      let result = areRolesEqual(role1, role2);

      expect(result).to.be.false;

      expect(get1).to.have.callCount(1);
      expect(get2).to.have.callCount(1);
    });

    it('throws when no property match', function() {
      let has = sinon.stub();
      has.withArgs('email').returns(false);
      has.withArgs('username').returns(false);
      let get = sinon.spy();

      let role1 = {
        has,
        get,
      };
      let role2 = {
        has,
        get,
      };

      expect(() => areRolesEqual(role1, role2)).to.throw('Checking the default role properties of "username" and "email" failed. Looks like you need to implement `areRolesEqual` yourself.');

      expect(get).to.have.callCount(0);
    });
  });

  describe('multiple browsers', function() {
    let count = 3;

    beforeEach(function() {
      setOptions({
        shareWebdriver: true,
        keepBrowserOpen: true,
        shareSession: true,
      });

      options.overrides.browsers = count;
    });

    it('log in', async function() {
      setOptions({
        shouldLogIn: true,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(count);
      expect(browserOverrideSpy).to.have.callCount(count);
      expect(logIn).to.have.callCount(count);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);
      expect(logIn).to.have.been.calledAfter(browserOverrideSpy);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowsers).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowsers).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowsers).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowsers);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleAfter();

      assertContext();

      reset();

      let loggedInRole = role;
      role = {};

      let areRolesEqual = sinon.stub().withArgs(role, loggedInRole).returns(true);

      setOptions({
        areRolesEqual,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(areRolesEqual).to.have.callCount(1);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      setOptions({
        areRolesEqual: null,
      });

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleAfter();

      assertContext();
    });

    it('don\'t log in', async function() {
      setOptions({
        shouldLogIn: false,
      });

      await beforeTest();

      expect(startWebDriver).to.have.callCount(1);
      expect(startBrowser).to.have.callCount(count);
      expect(browserOverrideSpy).to.have.callCount(count);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(startBrowser).to.have.been.calledAfter(startWebDriver);
      expect(browserOverrideSpy).to.have.been.calledAfter(startBrowser);

      expect(onStartWebDriver).to.have.callCount(1);
      expect(onStartBrowsers).to.have.callCount(1);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowsers).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onStartBrowsers).to.have.been.calledAfter(onStartWebDriver);
      expect(onInitContext).to.have.been.calledAfter(onStartBrowsers);
      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleAfter();

      assertContext();

      reset();

      await beforeTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(1);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      expect(onInitSession).to.have.been.calledAfter(onInitContext);

      assertLifecycleBefore();

      assertContext();

      reset();

      await eachTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleEach();

      assertContext();

      reset();

      await afterTest();

      expect(startWebDriver).to.have.callCount(0);
      expect(startBrowser).to.have.callCount(0);
      expect(browserOverrideSpy).to.have.callCount(0);
      expect(logIn).to.have.callCount(0);
      expect(logOut).to.have.callCount(0);
      expect(stopBrowser).to.have.callCount(0);
      expect(stopWebDriver).to.have.callCount(0);

      expect(onStartWebDriver).to.have.callCount(0);
      expect(onStartBrowser).to.have.callCount(0);
      expect(onInitContext).to.have.callCount(1);
      expect(onInitSession).to.have.callCount(0);
      expect(onStopBrowser).to.have.callCount(0);
      expect(onStopWebDriver).to.have.callCount(0);

      assertLifecycleAfter();

      assertContext();
    });
  });
});
