'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const { setUpWebDriver } = require('../packages/lifecycle/src');
const Server = require('../helpers/server');
const { promisify } = require('util');
const createTmpDir = promisify(require('tmp').dir);
const { writeFile } = require('fs').promises;
const path = require('path');

describe(function() {
  setUpWebDriver.call(this);

  let fixturesPath;

  before(function() {
    this.open = async function(pathname) {
      await this.browser.url(`http://localhost:${this.port}/${pathname}`);
    };

    this.writeFixture = async function(filename, fixtureData) {
      await writeFile(path.join(fixturesPath, filename), fixtureData);
    };

    this.attempt = 0;
  });

  beforeEach(async function() {
    fixturesPath = await createTmpDir();

    this.server = new Server(fixturesPath);

    this.port = await this.server.start();
  });

  afterEach(async function() {
    if (this.server) {
      await this.server.stop();
    }
  });

  it('works', async function() {
    await this.writeFixture('index.html', `
      <div class="foo">
        bar ${++this.attempt}
      </div>
    `);

    await this.open('index.html');

    expect(await this.browser.getText('.foo')).to.equal('bar 2');
  });
});
