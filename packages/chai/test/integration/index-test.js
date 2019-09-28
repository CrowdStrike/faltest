'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const Browser = require('../../../browser');
const {
  BaseElement,
  Element,
  Elements,
} = require('../../../page-objects');
const sinon = require('sinon');

describe(function() {
  let pageObject;
  let stub;

  function test(obj) {
    for (
      let [
        method,
        {
          builtIn,
          PageObject,
          pageObjectMethod,
          actualPass,
          actualFail,
          append,
          pageObjectString,
          fail,
          failNegated,
          shouldSkipSelector,
        },
      ] of Object.entries(obj)
    ) {
      // eslint-disable-next-line no-inner-declarations
      function expectTo() {
        return expect(pageObject)[method].to.eventually;
      }

      describe(method, function() {
        function testBlock() {
          beforeEach(function() {
            pageObject = new PageObject();

            stub = sinon.stub(pageObject, pageObjectMethod);
          });

          afterEach(function() {
            expect(stub).to.have.been.called;
          });

          describe('normal', function() {
            describe('pass', function() {
              it('works', async function() {
                stub.resolves(actualPass);

                await append(expectTo());
              });
            });

            describe('fail', function() {
              it('works', async function() {
                stub.resolves(actualFail);

                await expect(append(expectTo())).to.eventually.be
                  .rejectedWith(`${pageObjectString}: ${pageObjectMethod}: ${fail}`);
              });

              if (!shouldSkipSelector) {
                it('shows selector if available', async function() {
                  pageObject = new PageObject('.foo-bar');

                  stub = sinon.stub(pageObject, pageObjectMethod).resolves(actualFail);

                  await expect(append(expectTo())).to.eventually.be
                    .rejectedWith(`${pageObjectString} with selector ".foo-bar": ${pageObjectMethod}: ${fail}`);
                });

                it('doesn\'t show selector if not string', async function() {
                  pageObject = new PageObject({});

                  stub = sinon.stub(pageObject, pageObjectMethod).resolves(actualFail);

                  await expect(append(expectTo())).to.eventually.be
                    .rejectedWith(`${pageObjectString}: ${pageObjectMethod}: ${fail}`);
                });
              }
            });
          });

          describe('negated', function() {
            describe('pass', function() {
              it('works', async function() {
                stub.resolves(actualFail);

                await append(expectTo().not);
              });
            });

            describe('fail', function() {
              it('works', async function() {
                stub.resolves(actualPass);

                await expect(append(expectTo().not)).to.eventually.be
                  .rejectedWith(`${pageObjectString}: ${pageObjectMethod}: ${failNegated}`);
              });
            });
          });
        }

        if (builtIn) {
          describe('built-in', function() {
            beforeEach(function() {
              pageObject = builtIn;

              stub = pageObject[pageObjectMethod] = sinon.spy();
            });

            afterEach(function() {
              expect(stub).to.not.have.been.called;
            });

            it('preserves built-ins when not a page object', async function() {
              await append(expectTo());
            });
          });

          describe('override', testBlock);
        } else {
          testBlock();
        }
      });
    }
  }

  test({
    url: {
      PageObject: Browser,
      pageObjectMethod: 'getUrl',
      actualPass: 'foo',
      actualFail: 'bar',
      append: expectTo => expectTo.endWith('foo'),
      pageObjectString: 'browser',
      fail: 'expected bar to end with foo',
      failNegated: 'expected foo not to end with foo',
      shouldSkipSelector: true,
    },
    title: {
      PageObject: Browser,
      pageObjectMethod: 'getTitle',
      actualPass: 'foo',
      actualFail: 'bar',
      append: expectTo => expectTo.contain('foo'),
      pageObjectString: 'browser',
      fail: `expected 'bar' to include 'foo'`,
      failNegated: `expected 'foo' to not include 'foo'`,
      shouldSkipSelector: true,
    },
    text: {
      PageObject: Element,
      pageObjectMethod: 'getText',
      actualPass: 'foo',
      actualFail: 'bar',
      append: expectTo => expectTo.equal('foo'),
      pageObjectString: 'element',
      fail: `expected 'bar' to equal 'foo'`,
      failNegated: `expected 'foo' to not equal 'foo'`,
    },
    value: {
      PageObject: Element,
      pageObjectMethod: 'getValue',
      actualPass: 'foo',
      actualFail: 'bar',
      append: expectTo => expectTo.equal('foo'),
      pageObjectString: 'element',
      fail: `expected 'bar' to equal 'foo'`,
      failNegated: `expected 'foo' to not equal 'foo'`,
    },
    enabled: {
      PageObject: Element,
      pageObjectMethod: 'isEnabled',
      actualPass: true,
      actualFail: false,
      append: expectTo => expectTo.be.ok,
      pageObjectString: 'element',
      fail: 'expected false to be truthy',
      failNegated: 'expected true to be falsy',
    },
    exist: {
      builtIn: Promise.resolve(true),
      PageObject: BaseElement,
      pageObjectMethod: 'isExisting',
      actualPass: true,
      actualFail: false,
      append: expectTo => expectTo.be.ok,
      pageObjectString: 'element',
      fail: 'expected false to be truthy',
      failNegated: 'expected true to be falsy',
    },
    elements: {
      PageObject: Elements,
      pageObjectMethod: 'getElements',
      actualPass: [1, 2],
      actualFail: [1],
      append: expectTo => expectTo.have.a.lengthOf(2),
      pageObjectString: 'elements',
      fail: 'expected [ 1 ] to have a length of 2 but got 1',
      failNegated: 'expected [ 1, 2 ] to not have a length of 2',
    },
  });
});
