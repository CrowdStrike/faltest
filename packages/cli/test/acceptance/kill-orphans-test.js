'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const path = require('path');
const { startWebDriver } = require('../../../remote/src');

describe(function() {
  it('works', async function() {
    let webDriver = await startWebDriver({
      overrides: {
        browser: 'chrome',
        port: '0',
      },
    });

    let promise = new Promise(resolve => {
      webDriver.once('exit', resolve);
    });

    const { execaNode } = await import('execa');

    await execaNode('bin/kill-orphans', [], {
      cwd: path.resolve(__dirname, '../..'),
    });

    await expect(promise, 'webdriver is killed').to.eventually.be.fulfilled;
  });
});
