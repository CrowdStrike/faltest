'use strict';

const { setUpWebDriver } = require('@faltest/lifecycle');
const { expect } = require('chai');

describe('sample', function() {
  setUpWebDriver.call(this);

  it('works', async function() {
    await this.browser.url('https://webdriver.io');

    let title = await this.browser.getTitle();

    expect(title).to.equal('WebdriverIO · Next-gen WebDriver test framework for Node.js');
  });
});
