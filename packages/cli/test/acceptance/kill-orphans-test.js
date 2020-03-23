'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
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

    await exec('node bin/kill-orphans', {
      cwd: path.resolve(__dirname, '../..'),
    });

    await expect(promise, 'webdriver is killed').to.eventually.be.fulfilled;
  });
});
