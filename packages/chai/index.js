'use strict';

const Browser = require('@faltest/browser');
const {
  BaseElement,
  Element,
  Elements,
} = require('@faltest/page-objects');

const properties = {
  url: {
    type: 'addProperty',
    PageObject: Browser,
    pageObjectMethod: 'getUrl',
    pageObjectString: 'browser',
  },
  title: {
    type: 'addProperty',
    PageObject: Browser,
    pageObjectMethod: 'getTitle',
    pageObjectString: 'browser',
  },
  text: {
    type: 'addProperty',
    PageObject: Element,
    pageObjectMethod: 'getText',
    pageObjectString: 'element',
  },
  value: {
    type: 'addProperty',
    PageObject: Element,
    pageObjectMethod: 'getValue',
    pageObjectString: 'element',
  },
  enabled: {
    type: 'addProperty',
    PageObject: Element,
    pageObjectMethod: 'isEnabled',
    pageObjectString: 'element',
  },
  displayed: {
    type: 'addProperty',
    PageObject: Element,
    pageObjectMethod: 'isDisplayed',
    pageObjectString: 'element',
  },
  exist: {
    type: 'overwriteProperty',
    PageObject: BaseElement,
    pageObjectMethod: 'isExisting',
    pageObjectString: 'element',
  },
  elements: {
    type: 'addProperty',
    PageObject: Elements,
    pageObjectMethod: 'getElements',
    pageObjectString: 'elements',
  },
};

function chaiWebDriver(chai, utils) {
  let { Assertion } = chai;

  for (
    let [
      method,
      {
        type,
        PageObject,
        pageObjectMethod,
        pageObjectString,
      },
    ] of Object.entries(properties)
  ) {
    // eslint-disable-next-line no-inner-declarations
    function createCallback(_super) {
      return function() {
        let obj = this._obj;

        if (type === 'overwriteProperty') {
          if (!(obj instanceof PageObject)) {
            return _super.apply(this, arguments);
          }
        } else {
          new Assertion(obj).to.be.an.instanceof(PageObject);
        }

        let elementString = pageObjectString;

        if (typeof obj.selector === 'string') {
          elementString += ` with selector "${obj.selector}"`;
        }

        let newObj = obj[pageObjectMethod]();

        utils.flag(this, 'object', newObj);
        utils.flag(this, 'message', `${elementString}: ${pageObjectMethod}`);
      };
    }

    Assertion[type](method, type === 'overwriteProperty' ? createCallback : createCallback());
  }
}

module.exports = chaiWebDriver;

module.exports.properties = properties;
