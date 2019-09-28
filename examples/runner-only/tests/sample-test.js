'use strict';

const { setUpWebDriver } = require('@faltest/lifecycle');
const assert = require('assert');

describe('sample', function() {
  setUpWebDriver.call(this);

  it('works', async function() {
    await this.browser.url('https://webdriver.io');

    let title = await this.browser.getTitle();

    assert.strictEqual(title, 'WebdriverIO · Next-gen WebDriver test framework for Node.js');
  });
});
