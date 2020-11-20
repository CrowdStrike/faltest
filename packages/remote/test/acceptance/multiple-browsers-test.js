'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const {
  startWebDriver,
  startBrowser,
  stopBrowser,
  stopWebDriver,
} = require('../../../remote');

describe(function() {
  this.timeout(30e3);

  before(async function() {
    this.webDriver = await startWebDriver();
  });

  after(async function() {
    if (this.webDriver) {
      await stopWebDriver(this.webDriver);
    }
  });

  it('can manage multiple browsers', async function() {
    let browsers = await Promise.all([...Array(2)].map(startBrowser));

    await Promise.all(browsers.map(browser => {
      return browser.url('https://crowdstrike.github.io/faltest');
    }));

    let titles = await Promise.all(browsers.map(browser => {
      return browser.getTitle();
    }));

    for (let title of titles) {
      expect(title).to.equal('Testing FalTest');
    }

    await Promise.all(browsers.map(stopBrowser));
  });
});
