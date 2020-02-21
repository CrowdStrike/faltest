'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

describe(function() {
  describe('glob', function() {
    it('works', async function() {
      let { stdout } = await exec('node bin --reporter json test/fixtures/**/passing-test.js', {
        cwd: path.resolve(__dirname, '../..'),
        env: {
          FALTEST_PRINT_VERSION: false,
          ...process.env,
        },
      });

      let json = JSON.parse(stdout);

      expect(json.stats.tests).to.equal(1);
      expect(json.stats.failures).to.equal(0);
      expect(json.tests[0].fullTitle).to.equal('passing works');
    });

    it('all tests filtered out', async function() {
      let promise = exec('node bin test/fixtures/**/*-no-matches', {
        cwd: path.resolve(__dirname, '../..'),
      });

      await expect(promise).to.eventually.be.rejectedWith('no tests found');
    });
  });

  it('works with config', async function() {
    let { stdout } = await exec('node bin --reporter json test/fixtures/passing-test.js', {
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
    expect(json.tests[0].fullTitle).to.equal('passing works');
  });

  it('prints version', async function() {
    let { stdout } = await exec('node bin --help', {
      cwd: path.resolve(__dirname, '../..'),
    });

    let { name, version } = require('../../package');

    expect(stdout).to.contain(`${name} v${version}`);
  });

  it('allows custom bin', async function() {
    let { stdout } = await exec('node test/fixtures/bin --reporter json test/fixtures/passing-test.js', {
      cwd: path.resolve(__dirname, '../..'),
      env: {
        FALTEST_PRINT_VERSION: false,
        ...process.env,
      },
    });

    let json = JSON.parse(stdout);

    expect(json.stats.tests).to.equal(1);
    expect(json.stats.failures).to.equal(0);
    expect(json.tests[0].fullTitle).to.equal('passing works');
  });

  it('before error - no tests run', async function() {
    let stdout;

    try {
      await exec('node bin --reporter json test/fixtures/before-error-test.js', {
        cwd: path.resolve(__dirname, '../..'),
        env: {
          FALTEST_PRINT_VERSION: false,
          ...process.env,
        },
      });
    } catch (err) {
      expect(err.message).to.not.include('no tests found');

      stdout = err.stdout;
    }

    let json = JSON.parse(stdout);

    expect(json.stats.tests).to.equal(0);
    expect(json.stats.failures).to.equal(1);
    expect(json.failures[0].fullTitle).to.equal('before error "before all" hook for "works"');
    expect(json.failures[0].err.message).to.equal('thrown error in before hook');
  });
});
