'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle');
const { killOrphans } = require('../../../remote');
const Server = require('../../../../helpers/server');
const Browser = require('../..');

describe(Browser, function() {
  setUpWebDriver.call(this, {
    shareWebdriver: true,
    keepBrowserOpen: true,
    browserOverride: browser => new Browser(browser),
    overrides: {
      waitforTimeout: 0,
    },
  });

  let server;

  before(async function() {
    server = new Server();

    let port = await server.start();

    // TODO: make your own html page instead of using this one
    await this.browser.url(`http://localhost:${port}/page-objects.html`);
  });

  after(async function() {
    if (server) {
      await server.stop();
    }

    await killOrphans();
  });

  // No docs means a test is worth it to understand.
  // Remove these if the concept of an WebDriverIO element
  // that matches multiple DOM elements is documented.
  describe('verify ambiguous behaviour', function() {
    let browser;

    before(function() {
      browser = this.browser._browser;

      this.add = async function add() {
        await browser.execute(() => {
          // eslint-disable-next-line no-undef
          document.getElementById('ihd05NeRDE').innerHTML += '<div></div>';
        });
      };

      this.remove = async function remove() {
        await browser.execute(() => {
          // eslint-disable-next-line no-undef
          document.getElementById('ihd05NeRDE').removeChild(document.querySelector('#ihd05NeRDE div:first-child'));
        });
      };
    });

    beforeEach(async function() {
      await browser.execute(() => {
        // eslint-disable-next-line no-undef
        document.querySelector('body').innerHTML += '<div id="ihd05NeRDE"></div>';
      });
    });

    afterEach(async function() {
      await browser.execute(() => {
        // eslint-disable-next-line no-undef
        document.querySelector('body').removeChild(document.getElementById('ihd05NeRDE'));
      });
    });

    it('the concept of "existing" with multiple elements', async function() {
      let element = await browser.$('#ihd05NeRDE div');

      expect(await element.isExisting()).to.be.false;
      await expect(element.waitForExist()).to.eventually.be.rejected;
      await expect(element.waitForExist(undefined, true)).to.eventually.be.fulfilled;
      await this.add();
      expect(await element.isExisting()).to.be.true;
      await expect(element.waitForExist()).to.eventually.be.fulfilled;
      await expect(element.waitForExist(undefined, true)).to.eventually.be.rejected;
      await this.add();
      expect(await element.isExisting()).to.be.true;
      await expect(element.waitForExist()).to.eventually.be.fulfilled;
      await expect(element.waitForExist(undefined, true)).to.eventually.be.rejected;
      await this.remove();
      expect(await element.isExisting()).to.be.true;
      await expect(element.waitForExist()).to.eventually.be.fulfilled;
      await expect(element.waitForExist(undefined, true)).to.eventually.be.rejected;
      await this.remove();
      expect(await element.isExisting()).to.be.false;
      await expect(element.waitForExist()).to.eventually.be.rejected;
      await expect(element.waitForExist(undefined, true)).to.eventually.be.fulfilled;
    });
  });

  describe('error handling', function() {
    describe(Browser.prototype._findElement, function() {
      it('shows an appropriate error message', async function() {
        await expect(this.browser.click('#missing')).to.eventually.be
          .rejectedWith(`click(#missing): Can't call click on element with selector "#missing" because element wasn't found`);
      });

      it('cascades error messages for custom methods', async function() {
        let promise = this.browser.getText('#missing');

        await expect(promise).to.eventually.be
          .rejectedWith(`getText(#missing): Can't call getProperty on element with selector "#missing" because element wasn't found`);

        try {
          await promise;
        } catch (err) {
          expect(err.stack).to.contain(' at Browser.resolve [as getText] ');
        }
      });

      it('cascades error messages for function selectors plus args', async function() {
        let promise = this.browser.setValue(async () => {
          await this.browser.click('#missing');
        }, 'foo');

        await expect(promise).to.eventually.be
          .rejectedWith(`setValue(<func>,foo): click(#missing): Can't call click on element with selector "#missing" because element wasn't found`);

        try {
          await promise;
        } catch (err) {
          expect(err.stack).to.contain(' at Browser.resolve [as setValue] ');
          expect(err.stack).to.contain(' at Browser.resolve [as click] ');
        }
      });
    });

    describe(Browser.prototype.findChild, function() {
      it('shows an appropriate error message', async function() {
        await expect(this.browser.findChild('#missing1', '#missing2')).to.eventually.be
          .rejectedWith(`findChild(#missing1,#missing2): Can't call $ on element with selector "#missing1" because element wasn't found`);
      });

      it('cascades error messages for function selector parent', async function() {
        let promise = this.browser.findChild(async () => {
          await this.browser.click('#missing1');
        }, '#missing2');

        await expect(promise).to.eventually.be
          .rejectedWith(`findChild(<func>,#missing2): click(#missing1): Can't call click on element with selector "#missing1" because element wasn't found`);

        try {
          await promise;
        } catch (err) {
          expect(err.stack).to.contain(' at Browser.resolve [as findChild] ');
          expect(err.stack).to.contain(' at Browser.resolve [as click] ');
        }
      });

      it('cascades error messages for function selector child', async function() {
        let promise = this.browser.findChild('#missing1', async () => {
          await this.browser.click('#missing2');
        });

        await expect(promise).to.eventually.be
          .rejectedWith(`findChild(#missing1,<func>): click(#missing2): Can't call click on element with selector "#missing2" because element wasn't found`);

        try {
          await promise;
        } catch (err) {
          expect(err.stack).to.contain(' at Browser.resolve [as findChild] ');
          expect(err.stack).to.contain(' at Browser.resolve [as click] ');
        }
      });

      it('shows index for an array item from a class selector', async function() {
        let promise = this.browser.findChild(async () => {
          let elements = await this.browser.$$('.multiple1');
          return elements[0];
        }, async () => {
          await this.browser.click('#missing2');
        });

        await expect(promise).to.eventually.be
          .rejectedWith(`findChild(.multiple1[0],<func>): click(#missing2): Can't call click on element with selector "#missing2" because element wasn't found`);
      });
    });
  });
});
