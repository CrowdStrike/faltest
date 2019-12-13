'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle');
const {
  BasePageObject,
  BaseElement,
  Element,
  Elements,
} = require('../../src');
const Server = require('../../../../helpers/server');
const sinon = require('sinon');

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

  describe('wrapping page objects', function() {
    it('can send a page object to create', async function() {
      let page = this.createPage(class extends BasePageObject {
        get single2() {
          return this._create('#single2', ({ create }) => {
            return {
              div: this._create(create('div')),
            };
          });
        }
      });

      await expect(page.single2.div).text.to.eventually.equal('PVISJdaLbo');
    });

    it('using existing function doesn\'t cause a loop', async function() {
      let page = this.createPage(class extends BasePageObject {
        get single1() {
          return this._create(this._create('#single1'), ({ _super }) => {
            return {
              getText: async () => {
                let text = await _super.getText();
                return text;
              },
            };
          });
        }
      });

      await expect(page.single1).text.to.eventually.equal('6NloDvPFpv');
    });

    it('properly chains _super calls', async function() {
      let page = this.createPage(class extends BasePageObject {
        get single1_parent() {
          return this._create('#single1', ({ _super }) => {
            return {
              getText: async () => {
                let text = await _super.getText();
                return `${text}-4u2OuYI2Md`;
              },
            };
          });
        }
        get single1_child() {
          return this._create(this.single1_parent, ({ _super }) => {
            return {
              getText: async () => {
                let text = await _super.getText();
                return `${text}-npbLMXMU0r`;
              },
            };
          });
        }
      });

      await expect(page.single1_child).text.to.eventually.equal('6NloDvPFpv-4u2OuYI2Md-npbLMXMU0r');
    });
  });

  describe(Element, function() {
    it('works', async function() {
      let page = this.createPage(class extends BasePageObject {
        get single1() {
          return this._create('#single1');
        }
      });

      await expect(page.single1).text.to.eventually.equal('6NloDvPFpv');
    });

    it('using existing function doesn\'t cause a loop', async function() {
      let page = this.createPage(class extends BasePageObject {
        get single1() {
          return this._create('#single1', ({ _super }) => {
            return {
              getText: async () => {
                let text = await _super.getText();
                return text;
              },
            };
          });
        }
      });

      await expect(page.single1).text.to.eventually.equal('6NloDvPFpv');
    });

    it('can pass a page object to create', async function() {
      let page = this.createPage(class extends BasePageObject {
        get single2() {
          return this._create('#single2', ({ pageObject }) => {
            return {
              scopeDiv: id => {
                expect(id).to.equal('5QfPzaA6Iw');

                let div = pageObject.scopeChild('div');

                return this._create(div);
              },
            };
          });
        }
      });

      let div = page.single2.scopeDiv('5QfPzaA6Iw');

      await expect(div).text.to.eventually.equal('PVISJdaLbo');
    });

    it('can chain page objects', async function() {
      let page = this.createPage(class extends BasePageObject {
        get single4() {
          return this._create('#single4');
        }
      });

      let span = page.single4.scopeChild('div').scopeChild('span');

      await expect(span).text.to.eventually.equal('STRkdD1vQL');
    });
  });

  describe(Elements, function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.createSandbox();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('works', async function() {
      let page = this.createPage(class extends BasePageObject {
        get multiple1() {
          return this._createMany('.multiple1');
        }
      });

      let pageObjects = await page.multiple1.getPageObjects();
      expect(pageObjects).to.have.a.lengthOf(2);

      await expect(pageObjects[0]).text.to.eventually.equal('08IcL2gsWh');
      await expect(pageObjects[1]).text.to.eventually.equal('hPZU8ZqD2L');
    });

    it('single child', async function() {
      let page = this.createPage(class extends BasePageObject {
        get multiple2() {
          return this._createMany('.multiple2', ({ each }) => {
            each(({ create }) => ({
              div: create('div'),
            }));
          });
        }
      });

      let pageObjects = await page.multiple2.getPageObjects();
      expect(pageObjects).to.have.a.lengthOf(2);

      await expect(pageObjects[0].div).text.to.eventually.equal('oQZJkNUDiY');
      await expect(pageObjects[1].div).text.to.eventually.equal('nmcyRTJDTq');
    });

    it('multiple children', async function() {
      let page = this.createPage(class extends BasePageObject {
        get multiple3() {
          return this._createMany('.multiple3', ({ each }) => {
            each(({ createMany }) => {
              return {
                divs: createMany('div'),
              };
            });
          });
        }
      });

      let pageObjects = await page.multiple3.getPageObjects();
      expect(pageObjects).to.have.a.lengthOf(2);

      let divs = await pageObjects[0].divs.getPageObjects();
      expect(divs).to.have.a.lengthOf(2);
      await expect(divs[0]).text.to.eventually.equal('YxFX3ZVCpQ');
      await expect(divs[1]).text.to.eventually.equal('i7gzjtHIGu');

      divs = await pageObjects[1].divs.getPageObjects();
      expect(divs).to.have.a.lengthOf(2);
      await expect(divs[0]).text.to.eventually.equal('tUH71I02zx');
      await expect(divs[1]).text.to.eventually.equal('pqBNA7tZkX');
    });

    it('each props are available to chaining', async function() {
      let page = this.createPage(class extends BasePageObject {
        get multiple1() {
          return this._createMany('.multiple1', ({ each, pageObject }) => {
            each(() => {
              return {
                foo: 'foo',
              };
            });

            return {
              test: async () => {
                let divs = await pageObject.getPageObjects();
                return divs[0].foo;
              },
            };
          });
        }
      });

      expect(await page.multiple1.test()).to.equal('foo');
    });

    it('scoping is lazy', async function() {
      let page = this.createPage(class extends BasePageObject {
        get lateAddition() {
          return this._createMany('#late-addition', ({ each, create }) => {
            each(({ createMany }) => {
              return {
                addedLate1: createMany('div', ({ each }) => {
                  each(({ createMany }) => {
                    return {
                      addedLate2: createMany('div', ({ each }) => {
                        each(({ createMany }) => {
                          return {
                            addedLate3: createMany('div'),
                          };
                        });
                      }),
                    };
                  });
                }),
              };
            });

            return {
              addedLate1: create('div', ({ create }) => {
                return {
                  addedLate2: create('div', ({ create }) => {
                    return {
                      addedLate3: create('div'),
                    };
                  }),
                };
              }),
            };
          });
        }
      });

      let _findElement = sandbox.spy(page._browser, '_findElement');
      let _findElements = sandbox.spy(page._browser, '_findElements');

      function resetHistory() {
        _findElement.resetHistory();
        _findElements.resetHistory();
      }

      let { lateAddition } = page;
      let { addedLate1 } = lateAddition;
      let { addedLate2 } = addedLate1;
      let { addedLate3 } = addedLate2;

      expect(_findElement).to.not.have.been.called;
      expect(_findElements).to.not.have.been.called;

      await expect(lateAddition).elements.to.eventually.have.a.lengthOf(0);

      expect(_findElement).to.not.have.been.called;
      expect(_findElements).to.have.been.called;

      resetHistory();

      await this.browser.execute(() => {
        // eslint-disable-next-line no-undef
        document.querySelector('body').innerHTML += '<div id="late-addition"></div>';
      });

      expect(_findElement).to.not.have.been.called;
      expect(_findElements).to.not.have.been.called;

      await expect(lateAddition).elements.to.eventually.have.a.lengthOf(1);

      expect(_findElement).to.not.have.been.called;
      expect(_findElements).to.have.been.called;

      resetHistory();

      await expect(addedLate1).exist.to.eventually.not.be.ok;

      expect(_findElement).to.have.been.called;
      expect(_findElements).to.not.have.been.called;

      resetHistory();

      await this.browser.execute(() => {
        // eslint-disable-next-line no-undef
        document.querySelector('#late-addition').innerHTML = '<div></div>';
      });

      expect(_findElement).to.not.have.been.called;
      expect(_findElements).to.not.have.been.called;

      let [{ addedLate1: addedLate1Many }] = await lateAddition.getPageObjects();

      expect(_findElement).to.not.have.been.called;
      expect(_findElements).to.have.been.called;

      resetHistory();

      await expect(addedLate1).exist.to.eventually.be.ok;

      expect(_findElement).to.have.been.called;
      expect(_findElements).to.not.have.been.called;

      resetHistory();

      await expect(addedLate2).exist.to.eventually.not.be.ok;

      expect(_findElement).to.have.been.called;
      expect(_findElements).to.not.have.been.called;

      resetHistory();

      await this.browser.execute(() => {
        // eslint-disable-next-line no-undef
        document.querySelector('#late-addition > div').innerHTML = '<div></div>';
      });

      expect(_findElement).to.not.have.been.called;
      expect(_findElements).to.not.have.been.called;

      let [{ addedLate2: addedLate2Many }] = await addedLate1Many.getPageObjects();

      expect(_findElement).to.have.been.called;
      expect(_findElements).to.have.been.called;

      resetHistory();

      await expect(addedLate2).exist.to.eventually.be.ok;

      expect(_findElement).to.have.been.called;
      expect(_findElements).to.not.have.been.called;

      resetHistory();

      await expect(addedLate3).exist.to.eventually.not.be.ok;

      expect(_findElement).to.have.been.called;
      expect(_findElements).to.not.have.been.called;

      resetHistory();

      await this.browser.execute(() => {
        // eslint-disable-next-line no-undef
        document.querySelector('#late-addition > div > div').innerHTML = '<div></div>';
      });

      expect(_findElement).to.not.have.been.called;
      expect(_findElements).to.not.have.been.called;

      let [{ addedLate3: addedLate3Many }] = await addedLate2Many.getPageObjects();

      expect(_findElement).to.have.been.called;
      expect(_findElements).to.have.been.called;

      resetHistory();

      await expect(addedLate3).exist.to.eventually.be.ok;

      expect(_findElement).to.have.been.called;
      expect(_findElements).to.not.have.been.called;

      resetHistory();

      await this.browser.execute(() => {
        // eslint-disable-next-line no-undef
        document.querySelector('#late-addition > div > div > div').innerHTML = 'SBrth9AyO7';
      });

      expect(_findElement).to.not.have.been.called;
      expect(_findElements).to.not.have.been.called;

      await expect(addedLate3Many).elements.to.eventually.have.a.lengthOf(1);

      expect(_findElement).to.have.been.called;
      expect(_findElements).to.have.been.called;

      resetHistory();

      await expect(addedLate3).text.to.eventually.equal('SBrth9AyO7');

      expect(_findElement).to.have.been.called;
      expect(_findElements).to.not.have.been.called;
    });
  });

  describe('error handling', function() {
    it('doesn\'t retry when actually missing', async function() {
      let page = this.createPage(class extends BasePageObject {
        get missing1() {
          return this._create('#missing1');
        }
      });

      await expect(page.missing1.click()).to.eventually.be
        .rejectedWith(`click(#missing1): Can't call click on element with selector "#missing1" because element wasn't found`);
    });

    describe(BaseElement.prototype.isExisting, function() {
      it('ignores child\'s missing parent when checking for exist', async function() {
        let page = this.createPage(class extends BasePageObject {
          get missing1() {
            return this._create(async () => {
              return await this._browser.$('#missing1');
            }, ({ create }) => ({
              missing2: create('#missing2'),
            }));
          }
        });

        await expect(page.missing1.missing2.isExisting()).to.eventually.be.false;
      });

      it('ignores children\'s missing parent when checking for exist', async function() {
        let page = this.createPage(class extends BasePageObject {
          get missing1() {
            return this._create(async () => {
              return await this._browser.$('#missing1');
            }, ({ createMany }) => ({
              missing2: createMany('.missing2'),
            }));
          }
        });

        await expect(page.missing1.missing2.isExisting()).to.eventually.be.false;
      });
    });

    describe(BaseElement.prototype.waitForInsert, function() {
      it('recursively waits for insert of child\'s parents', async function() {
        let page = this.createPage(class extends BasePageObject {
          get missing1() {
            return this._create(async () => {
              return await this._browser.$('#missing1');
            }, ({ create }) => ({
              missing2: create('#missing2'),
            }));
          }
        });

        await expect(page.missing1.missing2.waitForInsert()).to.eventually.be
          .rejectedWith('waitForInsert(#missing1): element ("#missing1") still not existing');
      });

      it('recursively waits for insert of childrens\' parents', async function() {
        let page = this.createPage(class extends BasePageObject {
          get missing1() {
            return this._create(async () => {
              return await this._browser.$('#missing1');
            }, ({ createMany }) => ({
              missing2: createMany('.missing2'),
            }));
          }
        });

        await expect(page.missing1.missing2.waitForInsert()).to.eventually.be
          .rejectedWith('waitForInsert(#missing1): element ("#missing1") still not existing');
      });
    });

    describe(BaseElement.prototype.waitForDestroy, function() {
      it('ignores child\'s missing parent when waiting for destroy', async function() {
        let page = this.createPage(class extends BasePageObject {
          get missing1() {
            return this._create(async () => {
              return await this._browser.$('#missing1');
            }, ({ create }) => ({
              missing2: create('div'),
            }));
          }
        });

        await expect(page.missing1.missing2.waitForDestroy()).to.eventually.be.fulfilled;
      });

      it('ignores children\'s missing parent when waiting for destroy', async function() {
        let page = this.createPage(class extends BasePageObject {
          get missing1() {
            return this._create(async () => {
              return await this._browser.$('#missing1');
            }, ({ createMany }) => ({
              missing2: createMany('div'),
            }));
          }
        });

        await expect(page.missing1.missing2.waitForDestroy()).to.eventually.be.fulfilled;
      });
    });

    describe('stale', function() {
      before(function() {
        this.remove = async function remove() {
          await this.browser.execute(() => {
            // eslint-disable-next-line no-undef
            let node = document.getElementById('ULYQ9KJAER');
            if (node) {
              // eslint-disable-next-line no-undef
              document.querySelector('body').removeChild(node);
            }
          });
        };
      });

      beforeEach(async function() {
        await this.browser.execute(() => {
          // eslint-disable-next-line no-undef
          document.querySelector('body').innerHTML += '<div id="ULYQ9KJAER"><div>ULYQ9KJAER</div></div>';
        });
      });

      afterEach(async function() {
        await this.remove();
      });

      it(`handles a stale ${Element.name}`, async function() {
        let page = this.createPage(class extends BasePageObject {
          get missing1() {
            return this._createMany('#ULYQ9KJAER', ({ each }) => {
              each(({ create }) => ({
                missing2: create('div'),
              }));
            });
          }
        });

        let [{ missing2 }] = await page.missing1.getPageObjects();

        await expect(missing2.isExisting()).to.eventually.be.true;
        await expect(missing2.waitForInsert()).to.eventually.be.fulfilled;
        await expect(missing2.waitForDestroy()).to.eventually.be
          .rejectedWith('waitForDestroy(div): element ("div") still existing ');

        await this.remove();

        await expect(missing2.isExisting()).to.eventually.be.false;
        await expect(missing2.waitForInsert()).to.eventually.be
          .rejectedWith('waitForInsert(#ULYQ9KJAER[0]): element ("#ULYQ9KJAER") still not existing');
        await expect(missing2.waitForDestroy()).to.eventually.be.fulfilled;
      });

      it(`handles a stale ${Elements.name}`, async function() {
        let page = this.createPage(class extends BasePageObject {
          get missing1() {
            return this._createMany('#ULYQ9KJAER', ({ each }) => {
              each(({ createMany }) => ({
                missing2: createMany('div'),
              }));
            });
          }
        });

        let [{ missing2 }] = await page.missing1.getPageObjects();

        await expect(missing2.isExisting()).to.eventually.be.true;
        await expect(missing2.waitForInsert()).to.eventually.be.fulfilled;
        await expect(missing2.waitForDestroy()).to.eventually.be
          .rejectedWith('waitForDestroy(<func>): waitUntil condition timed out');

        await this.remove();

        await expect(missing2.isExisting()).to.eventually.be.false;
        await expect(missing2.waitForInsert()).to.eventually.be
          .rejectedWith('waitForInsert(#ULYQ9KJAER[0]): element ("#ULYQ9KJAER") still not existing');
        await expect(missing2.waitForDestroy()).to.eventually.be.fulfilled;
      });
    });

    describe('scoping', function() {
      it(`${Elements.prototype.scopeBy.name} handles a missing parent`, async function() {
        let page = this.createPage(class extends BasePageObject {
          get missing1() {
            return this._createMany('.missing1', ({ pageObject }) => ({
              missing2: this._create(pageObject.scopeBy()),
            }));
          }
        });

        await expect(page.missing1.missing2.isExisting()).to.eventually.be.false;
        await expect(page.missing1.missing2.waitForInsert()).to.eventually.be
          .rejectedWith('waitForInsert(.missing1): waitUntil condition timed out');
        await expect(page.missing1.missing2.waitForDestroy()).to.eventually.be.fulfilled;
      });

      it(`${Elements.prototype.scopeBy.name} handles a missing child`, async function() {
        let page = this.createPage(class extends BasePageObject {
          get multiple1() {
            return this._createMany('.multiple1', ({ pageObject }) => ({
              missing2: this._create(pageObject.scopeBy(() => false)),
            }));
          }
        });

        await expect(page.multiple1.missing2.isExisting()).to.eventually.be.false;
        await expect(page.multiple1.missing2.waitForInsert()).to.eventually.be
          .rejectedWith('findChild(.multiple1,<func>): scopeBy(.multiple1,<func>): Could not find match (length 2)');
        await expect(page.multiple1.missing2.waitForDestroy()).to.eventually.be.fulfilled;
      });

      it(`${BasePageObject.prototype.scopeChildren.name}: prevent waiting for existence on an already resolved empty array`, async function() {
        let page = this.createPage(class extends BasePageObject {
          get single1() {
            return this._create(async () => {
              return await this._browser.$('#single1');
            }, ({ pageObject }) => ({
              missing2: this._create(pageObject.scopeChildren('.missing2').scopeBy()),
            }));
          }
        });

        await expect(page.single1.missing2.isExisting()).to.eventually.be.false;
        await expect(page.single1.missing2.waitForInsert()).to.eventually.be
          .rejectedWith('waitForInsert(<func>): waitUntil condition timed out');
        await expect(page.single1.missing2.waitForDestroy()).to.eventually.be.fulfilled;
      });

      it(`${Elements.prototype.scopeByText.name}: findByText is properly retried`, async function() {
        let page = this.createPage(class extends BasePageObject {
          get single1() {
            return this._create(async () => {
              return await this._browser.$('#single1');
            }, ({ pageObject }) => ({
              missing2: this._create(pageObject.scopeChildren('.missing2').scopeByText('foo')),
            }));
          }
        });

        await expect(page.single1.missing2.isExisting()).to.eventually.be.false;
        await expect(page.single1.missing2.waitForInsert()).to.eventually.be
          .rejectedWith('waitForInsert(.missing2): waitUntil condition timed out after 0ms: waitForInsert(): findChild(.missing2,<func>): findByText(.missing2,foo): Find by text "foo" yielded no results.');
        await expect(page.single1.missing2.waitForDestroy()).to.eventually.be.fulfilled;
      });
    });
  });
});
