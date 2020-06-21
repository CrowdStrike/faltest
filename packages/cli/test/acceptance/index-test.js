'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const path = require('path');
const execa = require('execa');

const cwd = path.resolve(__dirname, '../..');
const env = {
  FALTEST_PRINT_VERSION: false,
};

describe(function() {
  describe('glob', function() {
    it('works', async function() {
      let { stdout } = await execa('node', ['bin', '--reporter=json', 'test/fixtures/**/passing-test.js'], {
        cwd,
        env,
      });

      let json = JSON.parse(stdout);

      expect(json.stats.tests).to.equal(1);
      expect(json.stats.failures).to.equal(0);
      expect(json.tests[0].fullTitle).to.equal('passing works');
    });

    it('all tests filtered out', async function() {
      let promise = execa('node', ['bin', 'test/fixtures/**/*-no-matches'], {
        cwd,
      });

      // chai-as-promised@7.1.1 isn't working here for some reason
      // await expect(promise).to.eventually.be.rejectedWith('Error: no tests found');

      try {
        await promise;

        expect(false, 'should have rejected').to.be.ok;
      } catch (err) {
        expect(err.stderr).to.include('Error: no tests found');
      }
    });
  });

  it('works with config', async function() {
    let { stdout } = await execa('node', ['bin', '--reporter=json', 'test/fixtures/passing-test.js'], {
      cwd,
      env: {
        ...env,
        FALTEST_CONFIG_DIR: 'test/fixtures',
      },
    });

    let json = JSON.parse(stdout);

    expect(json.stats.tests).to.equal(1);
    expect(json.stats.failures).to.equal(0);
    expect(json.tests[0].fullTitle).to.equal('passing works');
  });

  it('prints version', async function() {
    let { stdout } = await execa('node', ['bin', '--help'], {
      cwd,
    });

    let { name, version } = require('../../package');

    expect(stdout).to.contain(`${name} v${version}`);
  });

  it('allows custom bin', async function() {
    let { stdout } = await execa('node', ['test/fixtures/bin', '--reporter=json', ' test/fixtures/passing-test.js'], {
      cwd,
      env,
    });

    let json = JSON.parse(stdout);

    expect(json.stats.tests).to.equal(1);
    expect(json.stats.failures).to.equal(0);
    expect(json.tests[0].fullTitle).to.equal('passing works');
  });

  it('before error - no tests run', async function() {
    let promise = execa('node', ['bin', '--reporter=json', 'test/fixtures/before-error-test.js'], {
      cwd,
      env,
    });

    // chai-as-promised@7.1.1 isn't working here for some reason
    // await expect(promise).to.eventually.not.be.rejectedWith('Error: no tests found');

    let stdout;

    try {
      await promise;

      expect(true, 'should have rejected').to.be.ok;
    } catch (err) {
      expect(err.message).to.not.include('Error: no tests found');

      stdout = err.stdout;
    }

    let json = JSON.parse(stdout);

    expect(json.stats.tests).to.equal(0);
    expect(json.stats.failures).to.equal(1);
    expect(json.failures[0].fullTitle).to.equal('before error "before all" hook for "works"');
    expect(json.failures[0].err.message).to.equal('thrown error in before hook');
  });

  describe('duplicate', function() {
    it('works', async function() {
      let { stdout } = await execa('node', ['bin', '--duplicate=1', '--reporter=json', 'test/fixtures/**/passing-test.js'], {
        cwd,
        env,
      });

      for (let _stdout of [
        stdout.substr(0, stdout.length / 2),
        stdout.substr(stdout.length / 2),
      ]) {
        let json = JSON.parse(_stdout);

        expect(json.stats.tests).to.equal(1);
        expect(json.stats.failures).to.equal(0);
        expect(json.tests[0].fullTitle).to.equal('passing works');
      }
    });

    it('all tests filtered out', async function() {
      let promise = execa('node', ['bin', '--duplicate=1', 'test/fixtures/**/*-no-matches'], {
        cwd,
      });

      // chai-as-promised@7.1.1 isn't working here for some reason
      // await expect(promise).to.eventually.be.rejectedWith('Error: no tests found');

      try {
        await promise;

        expect(false, 'should have rejected').to.be.ok;
      } catch (err) {
        expect(err.stderr).to.include('Error: no tests found');
      }
    });
  });
});
