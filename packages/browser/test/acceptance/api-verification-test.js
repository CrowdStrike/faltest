'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle');
const { killOrphans } = require('../../../remote');
const Server = require('../../../../helpers/server');
const { promisify } = require('util');
const tmpDir = promisify(require('tmp').dir);
const writeFile = promisify(require('fs').writeFile);
const path = require('path');

describe(function() {
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

  it('isEnabled', async function() {
    await this.writeFixture('index.html', `
      <input class="foo" disabled>
    `);

    await this.open('index.html');

    expect(await this.browser.isEnabled('.foo'))
      .to.be.false;
  });

  it('waitForEnabled', async function() {
    await this.writeFixture('index.html', `
      <input class="foo">
    `);

    await this.open('index.html');

    await expect(this.browser.waitForEnabled('.foo'))
      .to.eventually.be.fulfilled;
  });

  it('waitForDisabled', async function() {
    await this.writeFixture('index.html', `
      <input class="foo" disabled>
    `);

    await this.open('index.html');

    await expect(this.browser.waitForDisabled('.foo'))
      .to.eventually.be.fulfilled;
  });

  it('isDisplayed', async function() {
    await this.writeFixture('index.html', `
      <input class="foo" style="display:none">
    `);

    await this.open('index.html');

    expect(await this.browser.isDisplayed('.foo'))
      .to.be.false;
  });

  it('waitForVisible', async function() {
    await this.writeFixture('index.html', `
      <input class="foo">
    `);

    await this.open('index.html');

    await expect(this.browser.waitForVisible('.foo'))
      .to.eventually.be.fulfilled;
  });

  it('waitForHidden', async function() {
    await this.writeFixture('index.html', `
      <input class="foo" style="display:none">
    `);

    await this.open('index.html');

    await expect(this.browser.waitForHidden('.foo'))
      .to.eventually.be.fulfilled;
  });

  it('isExisting', async function() {
    await this.writeFixture('index.html', `
    `);

    await this.open('index.html');

    expect(await this.browser.isExisting('.foo'))
      .to.be.false;
  });

  it('waitForInsert', async function() {
    await this.writeFixture('index.html', `
      <input class="foo">
    `);

    await this.open('index.html');

    await expect(this.browser.waitForInsert('.foo'))
      .to.eventually.be.fulfilled;
  });

  it('waitForDestroy', async function() {
    await this.writeFixture('index.html', `
    `);

    await this.open('index.html');

    await expect(this.browser.waitForDestroy('.foo'))
      .to.eventually.be.fulfilled;
  });
});
