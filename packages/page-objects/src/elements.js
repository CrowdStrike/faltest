'use strict';

const BaseElement = require('./base-element');

const { PageObjectRetryError } = BaseElement;

class Elements extends BaseElement {
  async getElements() {
    let elements = await this._browser._findElements(this._selector);
    return elements;
  }

  // node 10 async generators!
  // async *[Symbol.asyncIterator]() {
  //   let elements = await this.getElements();
  //   for (let element of elements) {
  //     let pageObject = this._create(element, this.eachProperties);
  //     yield pageObject;
  //   }
  // }
  async getPageObjects() {
    let elements = await this.getElements();
    return elements.map(element => {
      let pageObject = this._create(element, this.eachProperties);
      return pageObject;
    });
  }

  scopeByText() {
    return this._create(async () => {
      return await this._browser.findByText(this._selector, ...arguments);
    }, this.eachProperties);
  }

  scopeBy(callback) {
    return this._create(async () => {
      let pageObjects = await this.getPageObjects();

      for (let pageObject of pageObjects) {
        if (await callback.call(this, pageObject)) {
          return await pageObject.getElement();
        }
      }

      throw new PageObjectRetryError({
        pageObject: this,
        methodName: this.scopeBy.name,
        element: this._selector,
        args: arguments,
        message: `Could not find match (length ${pageObjects.length})`,
      });
    }, this.eachProperties);
  }
}

module.exports = Elements;
