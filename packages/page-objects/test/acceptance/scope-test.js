'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle/src');
const {
  BasePageObject,
} = require('../../src');
const Server = require('../../../../helpers/server');
const { promisify } = require('util');
const tmpDir = promisify(require('tmp').dir);
const writeFile = promisify(require('fs').writeFile);
const path = require('path');

describe(BasePageObject.prototype._scope, function() {
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

  describe('child scope', function() {
    it('works', async function() {
      await this.writeFixture('index.html', `
        <div class="foo">
          foo
          <div class="bar">
            bar
            <div class="baz">
              baz
            </div>
          </div>
        </div>
      `);

      let page = this.createPage(class extends BasePageObject {
        get foo() {
          return this._createMany('.foo', ({ each }) => {
            each(({ create, pageObject }) => ({
              bar: create('.bar', ({ create }) => ({
                baz: create('.baz'),
              })),
              test: async () => {
                return await pageObject.bar.baz.getText();
              },
            }));
          });
        }
      });

      await this.open('index.html');

      let text = await page.foo.nth(0).test();

      expect(text).to.equal('baz');
    });
  });
});
