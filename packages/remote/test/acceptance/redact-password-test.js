'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle');
const { setPassword } = require('../../src');
const debug = require('../../src/debug');
const sinon = require('sinon');
const Server = require('../../../../helpers/server');

describe.only(function() {
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

    let sandbox;
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
      sandbox = sinon.createSandbox();

      if (!debug.enabled) {
        // suppress real logging during this test
        // if logging is turned off
        debug.log = () => {};
      }
      debug.enabled = true;

      rawMethod = sandbox.stub(
        require('../../src/utils/require-before-webdriverio'),
        'rawMethod'
      );

      await this.browser.url(`http://localhost:${port}/redact-password.html`);
    });

    afterEach(function() {
      if (sandbox) {
        sandbox.restore();
      }

      resetDebug();
    });

    after(async function() {
      if (server) {
        await server.stop();
      }
    });

    it('hides any passwords from logs', async function() {
      let password = 'hKzIOvqs';

      let input = await this.browser.$('input');

      await setPassword(input, password);

      expect(await input.getValue()).to.equal(password);

      let args = [sinon.match.any, sinon.match.any, sinon.match({ text: '[REDACTED]' })];
      expect(rawMethod).to.have.been.calledWith(...args);
      expect(rawMethod.withArgs(...args)).to.have.been.calledOnce;
    });
  });
}
