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
  this.timeout(60e3);

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
      return browser.url('https://webdriver.io');
    }));

    let titles = await Promise.all(browsers.map(browser => {
      return browser.getTitle();
    }));

    for (let title of titles) {
      expect(title).to.equal('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js');
    }

    await Promise.all(browsers.map(stopBrowser));
  });
});
