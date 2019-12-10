'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle');
const {
  BasePageObject,
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

    await this.browser.url(`http://localhost:${port}/redact-password.html`);

    this.createPage = function(Page) {
      return new Page(this.browser);
    };
  });

  after(async function() {
    if (server) {
      await server.stop();
    }
  });

  it('can set a password', async function() {
    let page = this.createPage(class extends BasePageObject {
      get input() {
        return this._create('input');
      }
    });

    let password = '53jwMdYr';

    await page.input.setPassword(password);

    await expect(page.input).value.to.eventually.equal(password);
  });
});
