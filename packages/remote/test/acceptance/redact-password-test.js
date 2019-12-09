'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle');
const { setPassword } = require('../../src');
const debug = require('../../src/debug');
const sinon = require('sinon');
const Server = require('../../../../helpers/server');

const password = Math.random().toString(36).substr(2);

const passwordMatcher = sinon.match(obj => {
  if (typeof obj === 'string') {
    return obj.includes(password);
  }
  for (let key in obj) {
    return obj[key].includes(password);
  }
});

describe(function() {
  test('same log level', 'info');
  test('more permissive log level', 'trace');
});

function test(title, logLevel) {
  // eslint-disable-next-line mocha/max-top-level-suites
  describe(title, function() {
    setUpWebDriver.call(this, {
      shareWebdriver: true,
      shouldLogIn: false,
      overrides: {
        browser: 'chrome',
        logLevel,
      },
    });

    let rawMethod;

    let resetDebug = (obj => () => Object.assign(debug, obj))({
      enabled: debug.enabled,
      log: debug.log,
    });

    let server;
    let port;

    before(async function() {
      server = new Server();

      port = await server.start();
    });

    beforeEach(async function() {
      if (!debug.enabled) {
        // suppress real logging during this test
        // if logging is turned off
        debug.log = () => {};
      }
      debug.enabled = true;

      rawMethod = sinon.stub(
        require('../../src/utils/require-before-webdriverio'),
        'rawMethod',
      );

      await this.browser.url(`http://localhost:${port}/redact-password.html`);
    });

    afterEach(function() {
      sinon.restore();

      resetDebug();
    });

    after(async function() {
      if (server) {
        await server.stop();
      }
    });

    it('verifies our expectations are correct of what should be caught', async function() {
      let input = await this.browser.$('input');

      await input.setValue(password);

      expect(rawMethod.withArgs(passwordMatcher)).to.have.callCount(0);
      expect(rawMethod.withArgs(sinon.match.any, passwordMatcher)).to.have.callCount(0);
      expect(rawMethod.withArgs(sinon.match.any, sinon.match.any, passwordMatcher)).to.have.callCount(2);

      expect(await input.getValue()).to.equal(password);
    });

    it('hides any passwords from logs', async function() {
      let input = await this.browser.$('input');

      await setPassword(input, password);

      expect(rawMethod.withArgs(sinon.match.any, sinon.match.any, sinon.match({ text: '[REDACTED]' }))).to.have.been.calledOnce;
      expect(rawMethod.withArgs(sinon.match.any, sinon.match.any, sinon.match('[REDACTED]'))).to.have.been.calledOnce;

      expect(rawMethod.withArgs(passwordMatcher), 'check for any missed').to.have.callCount(0);
      expect(rawMethod.withArgs(sinon.match.any, passwordMatcher), 'check for any missed').to.have.callCount(0);
      expect(rawMethod.withArgs(sinon.match.any, sinon.match.any, passwordMatcher), 'check for any missed').to.have.callCount(0);

      expect(await input.getValue()).to.equal(password);
    });
  });
}
