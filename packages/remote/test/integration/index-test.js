'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const fkill = require('fkill');
const {
  killOrphans,
  getNewPort,
  startWebDriver: _startWebDriver,
  startBrowser: _startBrowser,
} = require('../../src');
const Server = require('../../../../helpers/server');
const sinon = require('sinon');

describe(function() {
  this.timeout(10e3);

  async function startWebDriver({
    browser,
  }) {
    return await _startWebDriver({
      overrides: { browser, port: '0' },
    });
  }

  async function startBrowser({
    browser,
    customizeCapabilities,
  }) {
    return await _startBrowser({
      customizeCapabilities,
      overrides: { browser, size: null },
    });
  }

  async function waitForWebDriverExit(webDriver) {
    return await new Promise(resolve => {
      webDriver.once('exit', resolve);
    });
  }

  async function waitForBrowserExit(browser) {
    return await new Promise(resolve => {
      (function restart() {
        browser.status().then(restart).catch(err => {
          if (err.code !== 'ECONNREFUSED') {
            throw err;
          }

          resolve();
        });
      })();
    });
  }

  afterEach(async function() {
    await killOrphans();
  });

  describe('crashed web driver cleans up browsers', function() {
    async function test(_browser) {
      let webDriver = await startWebDriver({ browser: _browser });

      let webDriverPromise = waitForWebDriverExit(webDriver);

      let browser = await startBrowser({ browser: _browser });

      let browserPromise = waitForBrowserExit(browser);

      await fkill(webDriver.pid);

      await Promise.all([
        expect(webDriverPromise, 'web driver is cleaned up').to.eventually.be.fulfilled,
        expect(browserPromise, 'browser is cleaned up').to.eventually.be.fulfilled,
      ]);
    }

    it('chrome', async function() {
      await test('chrome');
    });

    it('firefox', async function() {
      await test('firefox');
    });
  });

  describe('can alter capabilities', function() {
    async function test(_browser) {
      await startWebDriver({ browser: _browser });

      let customizeCapabilities = sinon.stub().withArgs(_browser, sinon.match.object).resolves();

      await startBrowser({
        browser: _browser,
        customizeCapabilities,
      });

      expect(customizeCapabilities).to.be.calledOnce;
    }

    it('chrome', async function() {
      await test('chrome');
    });

    it('firefox', async function() {
      await test('firefox');
    });
  });

  describe(killOrphans, function() {
    it('cleans up web drivers', async function() {
      let webDrivers = await Promise.all([
        startWebDriver({ browser: 'chrome' }),
        startWebDriver({ browser: 'firefox' }),
      ]);

      let [
        chromePromise,
        firefoxPromise,
      ] = webDrivers.map(waitForWebDriverExit);

      await killOrphans();

      await Promise.all([
        expect(chromePromise, 'chrome is cleaned up').to.eventually.be.fulfilled,
        expect(firefoxPromise, 'firefox is cleaned up').to.eventually.be.fulfilled,
      ]);
    });

    describe('cleans up browsers too', function() {
      async function test(_browser) {
        let webDriver = await startWebDriver({ browser: _browser });

        let webDriverPromise = waitForWebDriverExit(webDriver);

        let browser = await startBrowser({ browser: _browser });

        let browserPromise = waitForBrowserExit(browser);

        await killOrphans();

        await Promise.all([
          expect(webDriverPromise, 'web driver is cleaned up').to.eventually.be.fulfilled,
          expect(browserPromise, 'browser is cleaned up').to.eventually.be.fulfilled,
        ]);
      }

      it('chrome', async function() {
        await test('chrome');
      });

      it('firefox', async function() {
        await test('firefox');
      });
    });
  });

  describe(getNewPort, function() {
    let server;

    async function consumePort(port) {
      server = new Server();

      await server.start(port);
    }

    afterEach(async function() {
      if (server) {
        await server.stop();

        server = null;
      }
    });

    it('returns requested port when in use', async function() {
      let requested = '4444';

      await consumePort(requested);

      let actual = await getNewPort(requested);

      expect(actual).to.equal(requested);
    });

    it('returns random port when zero', async function() {
      let requested = '0';

      let actual = await getNewPort(requested);

      expect(actual).to.not.equal(requested);
      expect(actual).to.be.a('string');
      expect(parseInt(actual)).to.be.a('number');
    });

    it('returns random port when falsy', async function() {
      let requested = null;

      let actual = await getNewPort(requested);

      expect(actual).to.not.equal(requested);
      expect(actual).to.be.a('string');
      expect(parseInt(actual)).to.be.a('number');
    });
  });
});
