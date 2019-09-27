'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

describe(function() {
  it('works with glob', async function() {
    let { stdout } = await exec(`node bin --reporter json test/fixtures/**/*-test.js`, {
      cwd: path.resolve(__dirname, '../..'),
      env: {
        FALTEST_PRINT_VERSION: false,
        ...process.env,
      },
    });

    let json = JSON.parse(stdout);

    expect(json.stats.tests).to.equal(1);
    expect(json.stats.failures).to.equal(0);
    expect(json.tests[0].fullTitle).to.equal('sample works');
  });

  it('works with config', async function() {
    let { stdout } = await exec(`node bin --reporter json`, {
      cwd: path.resolve(__dirname, '../..'),
      env: {
        FALTEST_PRINT_VERSION: false,
        FALTEST_CONFIG_DIR: 'test/fixtures',
        ...process.env,
      },
    });

    let json = JSON.parse(stdout);

    expect(json.stats.tests).to.equal(1);
    expect(json.stats.failures).to.equal(0);
    expect(json.tests[0].fullTitle).to.equal('sample works');
  });

  it('prints version', async function() {
    let { stdout } = await exec(`node bin --help`, {
      cwd: path.resolve(__dirname, '../..'),
    });

    let { name, version } = require('../../package');

    expect(stdout).to.contain(`${name} v${version}`);
  });

  it('allows custom bin', async function() {
    let { stdout } = await exec(`node test/fixtures/bin --reporter json`, {
      cwd: path.resolve(__dirname, '../..'),
      env: {
        FALTEST_PRINT_VERSION: false,
        ...process.env,
      },
    });

    let json = JSON.parse(stdout);

    expect(json.stats.tests).to.equal(1);
    expect(json.stats.failures).to.equal(0);
    expect(json.tests[0].fullTitle).to.equal('sample works');
  });
});
