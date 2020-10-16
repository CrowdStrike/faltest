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
    await stopWebDriver(this.webDriver);
  });

  it('can manage multiple browsers', async function() {
    let [
      browser1,
      browser2,
    ] = await Promise.all([
      startBrowser(),
      startBrowser(),
    ]);

    await Promise.all([
      browser1.url('https://webdriver.io'),
      browser2.url('https://webdriver.io'),
    ]);

    let [
      title1,
      title2,
    ] = await Promise.all([
      browser1.getTitle(),
      browser2.getTitle(),
    ]);

    expect(title1).to.equal('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js');
    expect(title2).to.equal('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js');

    await Promise.all([
      stopBrowser(browser1),
      stopBrowser(browser2),
    ]);
  });
});
