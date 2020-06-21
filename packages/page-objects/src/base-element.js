'use strict';

const BasePageObject = require('./base-page-object');
const { ElementError } = require('@faltest/browser');
const { CustomMultiError } = require('verror-extra');

class PageObjectRetryError extends ElementError {
  constructor({ pageObject }) {
    super(...arguments);

    this.pageObject = pageObject;
  }
}

class BaseElement extends BasePageObject {
  constructor(selector, ...args) {
    super(...args);

    this._selector = selector;
  }

  async isExisting() {
    let { waitforTimeout } = this._browser._browser.options;

    return await handleError.call(this, async () => {
      // Don't wait for any missing dynamic parents to show up,
      // since we want an immediate answer in this case.
      // `setTimeout` would be preferable, but doesn't work.
      // await this._browser._browser.setTimeout({ implicit: 0 });
      this._browser._browser.options.waitforTimeout = 0;

      return await this._browser.isExisting(this._selector, ...arguments);
    }, () => {
      // If it's an expected error, that means a parent doesn't exist,
      // which also means the child can't exist, so exit successfully.
      return false;
    }, function() {
      this._browser._browser.options.waitforTimeout = waitforTimeout;
    });
  }

  async waitForInsert() {
    await handleError.call(this, async () => {
      await this._browser.waitForInsert(this._selector);
    }, async elementError => {
      // If it's an expected error, that means a parent doesn't exist,
      // so wait for the missing parent, then try again.
      if (elementError instanceof PageObjectRetryError) {
        await elementError.pageObject.waitForInsert(...arguments);
      } else {
        await this._browser.waitForInsert(elementError.element, ...arguments);
      }
      await this._browser.waitForInsert(this._selector, ...arguments);
    });
  }

  async waitForDestroy() {
    await handleError.call(this, async () => {
      await this._browser.waitForDestroy(this._selector, ...arguments);
    }, () => {
      // If it's an expected error, that means a parent doesn't exist,
      // which also means the child can't exist, so exit successfully.
    });
  }

  get selector() {
    return this._selector;
  }
}

function isExpectedError(elementError) {
  if (!elementError) {
    return false;
  }

  let isRetryError = elementError instanceof PageObjectRetryError;

  // We want to be very explicit to avoid capturing an unexpected error.
  let isExpectedElementError = elementError.name === 'findChild' && (
    elementError.cause.message === `Can't call $ on element with selector "${elementError.element.selector}" because element wasn't found` ||
    elementError.cause.message === `Can't call findElementFromElement on element with selector "${elementError.element.selector}" because element wasn't found`
  );
  let isExpectedElementsError = elementError.name === 'findChildren' && (
    elementError.cause.message === `Can't call $$ on element with selector "${elementError.element.selector}" because element wasn't found` ||
    elementError.cause.message === `Can't call findElementsFromElement on element with selector "${elementError.element.selector}" because element wasn't found`
  );

  let isExpectedOtherError = [
    'findByText',
  ].includes(elementError.name);

  return isRetryError || isExpectedElementError || isExpectedElementsError || isExpectedOtherError;
}

async function handleError(original, fallback, _finally = () => {}) {
  try {
    return await original();
  } catch (err) {
    let elementError = ElementError.findLastError(err);

    if (!isExpectedError(elementError)) {
      throw err;
    }

    try {
      return await fallback.call(this, elementError);
    } catch (retryError) {
      throw new CustomMultiError([retryError, err]);
    }
  } finally {
    await _finally.call(this);
  }
}

module.exports = BaseElement;
module.exports.PageObjectRetryError = PageObjectRetryError;
