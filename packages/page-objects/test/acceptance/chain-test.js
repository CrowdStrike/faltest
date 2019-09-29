'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle/src');
const { killOrphans } = require('@faltest/remote/src');
const {
  BasePageObject,
} = require('../../src');
const Server = require('../../../../helpers/server');
const { promisify } = require('util');
const tmpDir = promisify(require('tmp').dir);
const writeFile = promisify(require('fs').writeFile);
const path = require('path');

describe(BasePageObject.prototype._chain, function() {
  setUpWebDriver.call(this, {
    shareWebdriver: true,
    keepBrowserOpen: true,
    overrides: {
      browser: 'chrome',
      waitforTimeout: 0,
    },
  });

  let fixturesPath;

  before(function() {
    this.createPage = function(Page) {
      return new Page(this.browser);
    };

    this.open = async function(pathname) {
      await this.browser.url(`http://localhost:${this.port}/${pathname}`);
    };

    this.writeFixture = async function(filename, fixtureData) {
      await writeFile(path.join(fixturesPath, filename), fixtureData);
    };
  });

  beforeEach(async function() {
    fixturesPath = await tmpDir();

    this.server = new Server(fixturesPath);

    this.port = await this.server.start();
  });

  afterEach(async function() {
    if (this.server) {
      await this.server.stop();
    }
  });

  after(async function() {
    await killOrphans();
  });

  it('can chain', async function() {
    await this.writeFixture('index.html', `
      <div class="foo">
        <div class="bar">
          foo bar
        </div>
      </div>
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo')._chain(({ create }) => ({
          bar: create('.bar'),
        }));
      }
    });

    await this.open('index.html');

    await expect(this.page.foo.bar).text.to.eventually.equal('foo bar');
  });
});
