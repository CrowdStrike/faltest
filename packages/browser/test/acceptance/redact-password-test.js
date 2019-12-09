'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle');
const debug = require('@faltest/utils/src/debug');
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
        logLevel,
        waitforTimeout: 0,
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
        require('@faltest/utils/src/require-before-webdriverio'),
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
      await this.browser.setValue('input', password);

      expect(rawMethod.withArgs(passwordMatcher)).to.have.callCount(0);
      expect(rawMethod.withArgs(sinon.match.any, passwordMatcher)).to.have.callCount(0);
      expect(rawMethod.withArgs(sinon.match.any, sinon.match.any, passwordMatcher)).to.have.callCount(2);

      expect(await this.browser.getValue('input')).to.equal(password);
    });

    it('hides any passwords from logs', async function() {
      await this.browser.setPassword('input', password);

      expect(rawMethod.withArgs(sinon.match.any, sinon.match.any, sinon.match({ text: '[REDACTED]' }))).to.have.been.calledOnce;
      expect(rawMethod.withArgs(sinon.match.any, sinon.match.any, sinon.match('[REDACTED]'))).to.have.been.calledOnce;

      expect(rawMethod.withArgs(passwordMatcher), 'check for any missed').to.have.callCount(0);
      expect(rawMethod.withArgs(sinon.match.any, passwordMatcher), 'check for any missed').to.have.callCount(0);
      expect(rawMethod.withArgs(sinon.match.any, sinon.match.any, passwordMatcher), 'check for any missed').to.have.callCount(0);

      expect(await this.browser.getValue('input')).to.equal(password);
    });

    it('also hide empty strings', async function() {
      await this.browser.setPassword('input', '');

      expect(rawMethod.withArgs(sinon.match.any, sinon.match.any, sinon.match({ text: '[REDACTED]' }))).to.have.been.calledOnce;
      expect(rawMethod.withArgs(sinon.match.any, sinon.match.any, sinon.match('[REDACTED]'))).to.have.been.calledOnce;

      expect(await this.browser.getValue('input')).to.equal('');
    });

    it('hides any passwords from error messages', async function() {
      let err;
      try {
        await this.browser.setPassword('.missing', password);
      } catch (_err) {
        err = _err;
      }

      expect(err.message).to.contain('setPassword(.missing,[REDACTED])')
        .and.not.contain(password, 'check for any missed');
    });
  });
}
