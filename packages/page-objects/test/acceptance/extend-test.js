'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle');
const {
  BasePageObject,
  Element,
  Elements,
} = require('../../src');
const Server = require('../../../../helpers/server');

describe(function() {
  setUpWebDriver.call(this, {
    shareWebdriver: true,
    keepBrowserOpen: true,
    overrides: {
      waitforTimeout: 0,
    },
  });

  let server;

  before(async function() {
    server = new Server();

    let port = await server.start();

    await this.browser.url(`http://localhost:${port}/page-objects.html`);

    this.createPage = function(Page) {
      return new Page(this.browser);
    };
  });

  after(async function() {
    if (server) {
      await server.stop();
    }
  });

  it('can override a default class via empty string', async function() {
    class Single1 extends Element {}
    class Multiple1 extends Elements {}

    Single1.selector = '.missing';
    Multiple1.selector = '.missing';

    let page = this.createPage(class extends BasePageObject {
      get multiple1() {
        return this._create('.multiple1', ({ extend, extendMany }) => ({
          first: extend(Single1, ''),
          all: extendMany(Multiple1, ''),
        }));
      }
    });

    await expect(page.multiple1.first).text.to.eventually.equal('08IcL2gsWh');
    await expect(page.multiple1.all).elements.to.eventually.have.a.lengthOf(2);
  });
});
