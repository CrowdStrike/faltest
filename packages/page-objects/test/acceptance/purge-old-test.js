'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle');
const {
  BasePageObject,
  Table,
  Rows,
} = require('../../src');
const Server = require('../../../../helpers/server');
const { promisify } = require('util');
const tmpDir = promisify(require('tmp').dir);
const writeFile = promisify(require('fs').writeFile);
const path = require('path');

describe(Rows.prototype.purgeOld, function() {
  setUpWebDriver.call(this, {
    shareWebdriver: true,
    keepBrowserOpen: true,
    overrides: {
      waitforTimeout: 0,
    },
  });

  let fixturesPath;

  before(function() {
    this.createPage = function(Page) {
      return new Page(this.browser);
    };

    this.page = this.createPage(class extends BasePageObject {
      get table() {
        return this._extendMany(Table, null, ({ each }) => {
          each(({ pageObject }) => ({
            name: pageObject,
            async deleteRow() {
              await pageObject.click();
            },
          }));
        });
      }
    });
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

  it('can purge old rows', async function() {
    let firstRow = Rows.encodeString('test-name');

    await writeFile(path.join(fixturesPath, 'index.html'), `
      <table>
        <tr onclick="this.remove()"><td>${firstRow}</td></tr>
        <tr onclick="this.remove()"><td>${Rows.encodeString('test-name', true)}</td></tr>
      </table>
    `);

    await this.browser.url(`http://localhost:${this.port}/index.html`);

    await expect(this.page.table).elements.to.eventually.have.a.lengthOf(1);
    await expect(this.page.table.rows).elements.to.eventually.have.a.lengthOf(2);

    await this.page.table.rows.purgeOld(['test-name']);

    await expect(this.page.table).elements.to.eventually.have.a.lengthOf(1);
    await expect(this.page.table.rows).elements.to.eventually.have.a.lengthOf(1);
    await expect(this.page.table.rows.first).text.to.eventually.equal(firstRow);
  });

  it('purges only two rows by default', async function() {
    await writeFile(path.join(fixturesPath, 'index.html'), `
      <table>
        <tr onclick="this.remove()"><td>${Rows.encodeString('test-name', true)}</td></tr>
        <tr onclick="this.remove()"><td>${Rows.encodeString('test-name', true)}</td></tr>
        <tr onclick="this.remove()"><td>${Rows.encodeString('test-name', true)}</td></tr>
      </table>
    `);

    await this.browser.url(`http://localhost:${this.port}/index.html`);

    await expect(this.page.table).elements.to.eventually.have.a.lengthOf(1);
    await expect(this.page.table.rows).elements.to.eventually.have.a.lengthOf(3);

    await this.page.table.rows.purgeOld(['test-name']);

    await expect(this.page.table).elements.to.eventually.have.a.lengthOf(1);
    await expect(this.page.table.rows).elements.to.eventually.have.a.lengthOf(1);
  });

  it('purges from the end of the list', async function() {
    let firstRow = Rows.encodeString('test-name-1', true);

    await writeFile(path.join(fixturesPath, 'index.html'), `
      <table>
        <tr onclick="this.remove()"><td>${firstRow}</td></tr>
        <tr onclick="this.remove()"><td>${Rows.encodeString('test-name-2', true)}</td></tr>
        <tr onclick="this.remove()"><td>${Rows.encodeString('test-name-3', true)}</td></tr>
      </table>
    `);

    await this.browser.url(`http://localhost:${this.port}/index.html`);

    await expect(this.page.table).elements.to.eventually.have.a.lengthOf(1);
    await expect(this.page.table.rows).elements.to.eventually.have.a.lengthOf(3);

    await this.page.table.rows.purgeOld([
      'test-name-1',
      'test-name-2',
      'test-name-3',
    ]);

    await expect(this.page.table).elements.to.eventually.have.a.lengthOf(1);
    await expect(this.page.table.rows).elements.to.eventually.have.a.lengthOf(1);
    await expect(this.page.table.rows.last).text.to.eventually.equal(firstRow);
  });

  it('purges the last two out of range rows, ignoring in range', async function() {
    let lastRow = Rows.encodeString('test-name-3');

    await writeFile(path.join(fixturesPath, 'index.html'), `
      <table>
        <tr onclick="this.remove()"><td>${Rows.encodeString('test-name-1', true)}</td></tr>
        <tr onclick="this.remove()"><td>${Rows.encodeString('test-name-1')}</td></tr>
        <tr onclick="this.remove()"><td>${Rows.encodeString('test-name-2', true)}</td></tr>
        <tr onclick="this.remove()"><td>${Rows.encodeString('test-name-2')}</td></tr>
        <tr onclick="this.remove()"><td>${Rows.encodeString('test-name-3', true)}</td></tr>
        <tr onclick="this.remove()"><td>${lastRow}</td></tr>
      </table>
    `);

    await this.browser.url(`http://localhost:${this.port}/index.html`);

    await expect(this.page.table).elements.to.eventually.have.a.lengthOf(1);
    await expect(this.page.table.rows).elements.to.eventually.have.a.lengthOf(6);

    await this.page.table.rows.purgeOld([
      'test-name-1',
      'test-name-2',
      'test-name-3',
    ]);

    await expect(this.page.table).elements.to.eventually.have.a.lengthOf(1);
    await expect(this.page.table.rows).elements.to.eventually.have.a.lengthOf(4);
    await expect(this.page.table.rows.last).text.to.eventually.equal(lastRow);
  });

  it('throws a descriptive error if missing row.name', async function() {
    await writeFile(path.join(fixturesPath, 'index.html'), `
      <table>
        <tr onclick="this.remove()"><td>${Rows.encodeString('test-name', true)}</td></tr>
      </table>
    `);

    await this.browser.url(`http://localhost:${this.port}/index.html`);

    this.page = this.createPage(class extends BasePageObject {
      get table() {
        return this._extendMany(Table, null, ({ each }) => {
          each(({ pageObject }) => ({
            async deleteRow() {
              await pageObject.click();
            },
          }));
        });
      }
    });

    await expect(this.page.table.rows.purgeOld(['test-name']))
      .to.eventually.be.rejectedWith('You must implement `row.name` if you want to run `purgeOld`.');
  });

  it('throws a descriptive error if missing row.deleteRow', async function() {
    await writeFile(path.join(fixturesPath, 'index.html'), `
      <table>
      <tr onclick="this.remove()"><td>${Rows.encodeString('test-name', true)}</td></tr>
      </table>
    `);

    await this.browser.url(`http://localhost:${this.port}/index.html`);

    this.page = this.createPage(class extends BasePageObject {
      get table() {
        return this._extendMany(Table, null, ({ each }) => {
          each(({ pageObject }) => ({
            name: pageObject,
          }));
        });
      }
    });

    await expect(this.page.table.rows.purgeOld(['test-name']))
      .to.eventually.be.rejectedWith('You must implement `row.deleteRow` if you want to run `purgeOld`.');
  });
});
