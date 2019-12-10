'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle/src');
const {
  BasePageObject,
  Elements,
  Element,
} = require('../../src');
const Server = require('../../../../helpers/server');
const { promisify } = require('util');
const tmpDir = promisify(require('tmp').dir);
const writeFile = promisify(require('fs').writeFile);
const path = require('path');

describe(Elements, function() {
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

  describe('ChildType', function() {
    it('can override', async function() {
      await this.writeFixture('index.html', `
        <div class="foo">
          <div class="bar">
            foo bar
          </div>
        </div>
      `);

      class Multiple extends Elements {
        constructor() {
          super(...arguments);

          this.ChildType = Single;
        }
      }

      Multiple.selector = '.foo';

      class Single extends Element {
        get bar() {
          return this._create('.bar');
        }
      }

      this.page = this.createPage(class extends BasePageObject {
        get foo() {
          return this._extendMany(Multiple);
        }
      });

      await this.open('index.html');

      await expect(this.page.foo.first.bar).text.to.eventually.equal('foo bar');
    });
  });

  describe('first and last', function() {
    it('works', async function() {
      await this.writeFixture('index.html', `
        <div class="foo">
        </div>
      `);

      this.page = this.createPage(class extends BasePageObject {
        get bar() {
          return this._createMany('.bar');
        }
      });

      await this.open('index.html');

      await expect(this.page.bar.first.waitForInsert()).to.eventually.be
        .rejectedWith('waitForInsert(): waitUntil condition timed out');
      await expect(this.page.bar.last.waitForInsert()).to.eventually.be
        .rejectedWith('waitForInsert(): waitUntil condition timed out');

      await this.browser.execute(() => {
        // eslint-disable-next-line no-undef
        document.querySelector('.foo').innerHTML += `
          <div class="bar">
            bar1
          </div>
          <div class="bar">
            bar2
          </div>
        `;
      });

      await expect(this.page.bar.first).text.to.eventually.equal('bar1');
      await expect(this.page.bar.last).text.to.eventually.equal('bar2');
    });
  });
});
