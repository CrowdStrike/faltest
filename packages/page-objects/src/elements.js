'use strict';

const BaseElement = require('./base-element');
const Element = require('./element');

const { PageObjectRetryError } = BaseElement;

class Elements extends BaseElement {
  constructor() {
    super(...arguments);

    this.ChildType = Element;
  }

  async getElements() {
    let elements = await this._browser._findElements(this._selector);
    return elements;
  }

  // node 10 async generators!
  // async *[Symbol.asyncIterator]() {
  //   let elements = await this.getElements();
  //   for (let element of elements) {
  //     let pageObject = this._extend(this.ChildType, element, this.eachProperties);
  //     yield pageObject;
  //   }
  // }
  async getPageObjects() {
    let elements = await this.getElements();
    return elements.map(element => {
      let pageObject = this._extend(this.ChildType, element, this.eachProperties);
      return pageObject;
    });
  }

  scopeByText() {
    return this._extend(this.ChildType, async () => {
      return await this._browser.findByText(this._selector, ...arguments);
    }, this.eachProperties);
  }

  scopeBy(callback) {
    return this._extend(this.ChildType, async () => {
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

  get first() {
    return this._extend(this.ChildType, async () => {
      let elements = await this.getElements();
      return elements[0];
    }, this.eachProperties);
  }

  get last() {
    return this._extend(this.ChildType, async () => {
      let elements = await this.getElements();
      return elements[elements.length - 1];
    }, this.eachProperties);
  }
}

module.exports = Elements;
