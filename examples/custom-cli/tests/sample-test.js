'use strict';

const { setUpWebDriver } = require('@faltest/lifecycle');
const assert = require('assert');

describe('sample', function() {
  setUpWebDriver.call(this);

  it('works', async function() {
    await this.browser.url('https://crowdstrike.github.io/faltest');

    let title = await this.browser.getTitle();

    assert.strictEqual(title, 'Testing FalTest');
  });
});
