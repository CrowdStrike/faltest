'use strict';

const { setUpWebDriver } = require('@faltest/lifecycle');
const assert = require('assert');

describe('sample', function() {
  setUpWebDriver.call(this);

  it('works', async function() {
    await Promise.all([
      this.browsers[0].url('https://webdriver.io'),
      this.browsers[1].url('https://webdriver.io'),
    ]);

    let [
      title1,
      title2,
    ] = await Promise.all([
      this.browsers[0].getTitle(),
      this.browsers[1].getTitle(),
    ]);

    assert.strictEqual(title1, 'WebdriverIO · Next-gen WebDriver test framework for Node.js');
    assert.strictEqual(title2, 'WebdriverIO · Next-gen WebDriver test framework for Node.js');
  });
});
