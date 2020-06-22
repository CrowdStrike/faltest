'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle');
const {
  BasePageObject,
  Element,
} = require('../../src');
const Server = require('../../../../helpers/server');
const { promisify } = require('util');
const tmpDir = promisify(require('tmp').dir);
const writeFile = promisify(require('fs').writeFile);
const path = require('path');

const attributeEquals = (attr, value) =>
  async (pageObject) => (await pageObject.getAttribute(attr)) === value;

describe(function() {
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

    if (this.browser && this.browser.options) {
      // some of the tests need to validate wait conditions and modify the wait
      // timeout so this needs to be reset to avoid leaking context between tests
      this.browser.options.waitforTimeout = 0;
    }
  });

  it(Element.prototype.isEnabled, async function() {
    await this.writeFixture('index.html', `
      <input class="foo" disabled>
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo)
      .enabled.to.eventually.be.false;
  });

  describe(Element.prototype.waitForEnabled, function() {
    it('waits for element to become enabled', async function() {
      await this.writeFixture('index.html', `
        <input class="foo">
      `);

      this.page = this.createPage(class extends BasePageObject {
        get foo() {
          return this._create('.foo');
        }
      });

      await this.open('index.html');

      await expect(this.page.foo.waitForEnabled())
        .to.eventually.be.fulfilled;
    });

    it('waits for scoped element to become enabled', async function() {
      await this.writeFixture('index.html', `
        <input class="foo" name="foo" disabled>
        <input class="foo" name="bar" id="foo" disabled>
      `);

      this.page = this.createPage(class extends BasePageObject {
        get foo() {
          return this._createMany('.foo');
        }
      });

      await this.open('index.html');

      this.page._browser._browser.options.waitforTimeout = 10000;
      this.page._browser._browser.execute(`(() => {
        setTimeout(function() {
          const element = document.getElementById('foo');
          element.disabled = false;
        }, 100);
      })()`);

      await expect(this.page.foo.scopeBy(attributeEquals('name', 'bar')).waitForEnabled())
        .to.eventually.be.fulfilled;
    });
  });

  describe(Element.prototype.waitForDisabled, function() {
    it('waits for element to become disabled', async function() {
      await this.writeFixture('index.html', `
        <input class="foo" disabled>
      `);

      this.page = this.createPage(class extends BasePageObject {
        get foo() {
          return this._create('.foo');
        }
      });

      await this.open('index.html');

      await expect(this.page.foo.waitForDisabled())
        .to.eventually.be.fulfilled;
    });

    it('waits for scoped element to become disabled', async function() {
      await this.writeFixture('index.html', `
        <input class="foo" name="foo">
        <input class="foo" name="bar" id="foo">
      `);

      this.page = this.createPage(class extends BasePageObject {
        get foo() {
          return this._createMany('.foo');
        }
      });

      await this.open('index.html');

      this.page._browser._browser.options.waitforTimeout = 10000;
      this.page._browser._browser.execute(`(() => {
        setTimeout(function() {
          const element = document.getElementById('foo');
          element.disabled = true;
        }, 100);
      })()`);

      await expect(this.page.foo.scopeBy(attributeEquals('name', 'bar')).waitForDisabled())
        .to.eventually.be.fulfilled;
    });
  });


  it(Element.prototype.isDisplayed, async function() {
    await this.writeFixture('index.html', `
      <input class="foo" style="display:none">
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo)
      .displayed.to.eventually.be.false;
  });

  describe(Element.prototype.waitForVisible, function() {
    it('waits for element to become visible', async function() {
      await this.writeFixture('index.html', `
        <input class="foo">
      `);

      this.page = this.createPage(class extends BasePageObject {
        get foo() {
          return this._create('.foo');
        }
      });

      await this.open('index.html');

      await expect(this.page.foo.waitForVisible())
        .to.eventually.be.fulfilled;
    });

    it('waits for scoped element to become visible', async function() {
      await this.writeFixture('index.html', `
        <div class="foo" style="display:none">Foo</div>
        <div class="foo" id="foo" style="display:none">Bar</div>
      `);

      this.page = this.createPage(class extends BasePageObject {
        get foo() {
          return this._createMany('.foo');
        }
      });

      await this.open('index.html');

      this.page._browser._browser.options.waitforTimeout = 10000;
      this.page._browser._browser.execute(`(() => {
        setTimeout(function() {
          const element = document.getElementById('foo');
          element.style = 'display:block';
        }, 100);
      })()`);

      await expect(this.page.foo.scopeByText('Bar').waitForVisible())
        .to.eventually.be.fulfilled;
    });
  });

  describe(Element.prototype.waitForHidden, function() {
    it('waits for element to become hidden', async function() {
      await this.writeFixture('index.html', `
        <input class="foo" style="display:none">
      `);

      this.page = this.createPage(class extends BasePageObject {
        get foo() {
          return this._create('.foo');
        }
      });

      await this.open('index.html');

      await expect(this.page.foo.waitForHidden())
        .to.eventually.be.fulfilled;
    });

    it('waits for scoped element to become hidden', async function() {
      await this.writeFixture('index.html', `
        <div class="foo">Foo</div>
        <div class="foo" id="foo">Bar</div>
      `);

      this.page = this.createPage(class extends BasePageObject {
        get foo() {
          return this._createMany('.foo');
        }
      });

      await this.open('index.html');

      this.page._browser._browser.options.waitforTimeout = 10000;
      this.page._browser._browser.execute(`(() => {
        setTimeout(function() {
          const element = document.getElementById('foo');
          element.style = 'display:none';
        }, 100);
      })()`);

      await expect(this.page.foo.scopeByText('Bar').waitForHidden())
        .to.eventually.be.fulfilled;
    });
  });

  it(Element.prototype.isExisting, async function() {
    await this.writeFixture('index.html', `
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo)
      .exist.to.eventually.be.false;
  });

  describe(Element.prototype.waitForInsert, function() {
    it('waits for element to be inserted', async function() {
      await this.writeFixture('index.html', `
        <input class="foo">
      `);

      this.page = this.createPage(class extends BasePageObject {
        get foo() {
          return this._create('.foo');
        }
      });

      await this.open('index.html');

      await expect(this.page.foo.waitForInsert())
        .to.eventually.be.fulfilled;
    });

    it('waits for scoped element to be inserted', async function() {
      await this.writeFixture('index.html', `
        <div class="foo">Foo</div>
      `);

      this.page = this.createPage(class extends BasePageObject {
        get foo() {
          return this._createMany('.foo');
        }
      });

      await this.open('index.html');

      this.page._browser._browser.options.waitforTimeout = 10000;
      this.page._browser._browser.execute(`(() => {
        setTimeout(function() {
          const element = document.createElement('div');
          element.innerHTML = 'Bar';
          element.className = 'foo';
          document.body.appendChild(element);
        }, 100);
      })()`);

      await expect(this.page.foo.scopeByText('Bar').waitForInsert())
        .to.eventually.be.fulfilled;
    });
  });

  describe(Element.prototype.waitForDestroy, function() {
    it('waits for element to be destroyed', async function() {
      await this.writeFixture('index.html', `
      `);

      this.page = this.createPage(class extends BasePageObject {
        get foo() {
          return this._create('.foo');
        }
      });

      await this.open('index.html');

      await expect(this.page.foo.waitForDestroy())
        .to.eventually.be.fulfilled;
    });

    it('waits for scoped element to be destroyed', async function() {
      await this.writeFixture('index.html', `
        <div class="foo">Foo</div>
        <div class="foo" id="foo">Bar</div>
      `);

      this.page = this.createPage(class extends BasePageObject {
        get foo() {
          return this._createMany('.foo');
        }
      });

      await this.open('index.html');

      this.page._browser._browser.options.waitforTimeout = 10000;
      this.page._browser._browser.execute(`(() => {
        setTimeout(function() {
          const element = document.getElementById('foo');
          element.parentNode.removeChild(element);
        }, 100);
      })()`);

      await expect(this.page.foo.scopeByText('Bar').waitForDestroy())
        .to.eventually.be.fulfilled;
    });
  });

  it(Element.prototype.getAttribute, async function() {
    await this.writeFixture('index.html', `
      <div class="foo">
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo.getAttribute('class'))
      .to.eventually.equal('foo');
  });
});
