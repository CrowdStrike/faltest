'use strict';

const BaseElement = require('./base-element');

class Element extends BaseElement {
  async getElement() {
    return await this._browser._findElement(this._selector, ...arguments);
  }

  async isEnabled() {
    return await this._browser.isEnabled(this._selector, ...arguments);
  }

  async waitForEnabled() {
    await this.waitForInsert();
    await this._browser.waitForEnabled(this._selector, ...arguments);
  }

  async waitForDisabled() {
    await this.waitForInsert();
    await this._browser.waitForDisabled(this._selector, ...arguments);
  }

  async isDisplayed() {
    return await this._browser.isDisplayed(this._selector, ...arguments);
  }

  async waitForVisible() {
    await this.waitForInsert();
    await this._browser.waitForVisible(this._selector, ...arguments);
  }

  async waitForHidden() {
    await this.waitForInsert();
    await this._browser.waitForHidden(this._selector, ...arguments);
  }

  async waitForText() {
    await this._browser.waitForText(this._selector, ...arguments);
  }

  async scrollIntoView() {
    await this._browser.scrollIntoView(this._selector, ...arguments);
  }

  async getText() {
    return await this._browser.getText(this._selector, ...arguments);
  }

  async getValue() {
    return await this._browser.getValue(this._selector, ...arguments);
  }

  async click() {
    await this._browser.click(this._selector, ...arguments);
  }

  async setValue() {
    await this._browser.setValue(this._selector, ...arguments);
  }

  async setPassword() {
    await this._browser.setPassword(this._selector, ...arguments);
  }

  async sendKeys() {
    await this._browser.elementSendKeys(this._selector, ...arguments);
  }

  async moveTo() {
    await this._browser.moveTo(this._selector, ...arguments);
  }

  async getAttribute() {
    return await this._browser.getAttribute(this._selector, ...arguments);
  }
}

module.exports = Element;
