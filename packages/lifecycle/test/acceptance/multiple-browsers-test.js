'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../src');
const Server = require('../../../../helpers/server');
const { promisify } = require('util');
const createTmpDir = promisify(require('tmp').dir);
const { writeFile } = require('fs').promises;
const path = require('path');

describe(function() {
  setUpWebDriver.call(this, {
    shareWebdriver: true,
    keepBrowserOpen: true,
    overrides: {
      browsers: 2,
    },
  });

  let fixturesPath;

  before(function() {
    this.writeFixture = async function(filename, fixtureData) {
      await writeFile(path.join(fixturesPath, filename), fixtureData);
    };
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

  it('can manage multiple browsers', async function() {
    await this.writeFixture('index1.html', `
      <html>
        <head>
          <title>Browser 1</title>
        </head>
      </html>
    `);
    await this.writeFixture('index2.html', `
      <html>
        <head>
          <title>Browser 2</title>
        </head>
      </html>
    `);

    await Promise.all([
      this.browsers[0].url(`http://localhost:${this.port}/index1.html`),
      this.browsers[1].url(`http://localhost:${this.port}/index2.html`),
    ]);

    await Promise.all([
      expect(this.browsers[0]).title.to.eventually.equal('Browser 1'),
      expect(this.browsers[1]).title.to.eventually.equal('Browser 2'),
    ]);
  });
});
