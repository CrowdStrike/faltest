'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const path = require('path');
const clearModule = require('clear-module');
const { runTests: _runTests } = require('../../src');
const { promisify } = require('util');
const tmpDir = promisify(require('tmp').dir);
const failureArtifacts = require('../../src/failure-artifacts');

const fixturesPath = path.resolve(__dirname, '../fixtures');

describe(function() {
  describe(_runTests, function() {
    let globs;

    before(function() {
      this.runTests = async options => {
        return await _runTests({
          globs,
          ...options,
        });
      };
    });

    afterEach(function() {
      // unfortunately, mocha caches previously run files,
      // even though it is a new instance...
      // https://github.com/mochajs/mocha/blob/v6.2.0/lib/mocha.js#L334
      clearModule.all();
    });

    describe('tags', function() {
      before(function() {
        globs = [path.join(fixturesPath, 'tag-test.js')];
      });

      it('works', async function() {
        let stats = await this.runTests();

        expect(stats.passes).to.equal(5);
      });

      it('works with a tag', async function() {
        let stats = await this.runTests({
          tag: ['tag1'],
        });

        expect(stats.passes).to.equal(1);
      });

      it('ignores #', async function() {
        let stats = await this.runTests({
          tag: ['#tag1'],
        });

        expect(stats.passes).to.equal(1);
      });

      it('works with an inverted tag', async function() {
        let stats = await this.runTests({
          tag: ['!tag1'],
        });

        expect(stats.passes).to.equal(4);
      });

      it('does\'t match other tags when substring', async function() {
        let stats = await this.runTests({
          tag: ['tag'],
        });

        expect(stats.passes).to.equal(1);
      });

      it('does\'t match other tags when substring - negated', async function() {
        let stats = await this.runTests({
          tag: ['!tag'],
        });

        expect(stats.passes).to.equal(4);
      });
    });

    describe('filter', function() {
      before(function() {
        globs = [path.join(fixturesPath, 'filter-test.js')];
      });

      it('works with a filter', async function() {
        let stats = await this.runTests({
          filter: '#tag1',
        });

        expect(stats.passes).to.equal(1);
      });
    });

    describe('roles', function() {
      before(function() {
        globs = [path.join(fixturesPath, 'role-test.js')];
      });

      it('works', async function() {
        let stats = await this.runTests();

        expect(stats.passes).to.equal(3);
      });

      it('works with a role', async function() {
        let stats = await this.runTests({
          tag: ['role1'],
        });

        expect(stats.passes).to.equal(1);
      });

      it('works with an inverted role', async function() {
        let stats = await this.runTests({
          tag: ['!role1'],
        });

        expect(stats.passes).to.equal(2);
      });
    });

    describe('feature flags', function() {
      before(function() {
        globs = [path.join(fixturesPath, 'flag-test.js')];
      });

      it('works', async function() {
        let stats = await this.runTests();

        expect(stats.passes).to.equal(1);
      });
    });

    describe('retries', function() {
      before(function() {
        globs = [path.join(fixturesPath, 'retries-test.js')];
      });

      it('works', async function() {
        let stats = await this.runTests({
          retries: 1,
        });

        expect(stats.passes).to.equal(1);
      });
    });

    describe('reporter', function() {
      before(function() {
        globs = [path.join(fixturesPath, 'reporter-test.js')];
      });

      beforeEach(async function() {
        this.output = path.join(await tmpDir(), 'output-test');
      });

      it('works', async function() {
        await this.runTests({
          reporter: 'xunit',
          reporterOptions: `output=${this.output}`,
        });

        expect(this.output).to.be.a.file()
          .with.contents.that.match(/^<testsuite /);
      });
    });

    describe('failure artifacts', function() {
      before(function() {
        globs = [path.join(fixturesPath, 'failure-artifacts-test.js')];

        let { runTests } = this;
        this.runTests = async options => {
          return await runTests({
            failureArtifacts: true,
            failureArtifactsOutputDir: this.outputDir,
            ...options,
          });
        };
      });

      beforeEach(async function() {
        this.outputDir = await tmpDir();
      });

      it('works', async function() {
        let stats = await this.runTests({
          filter: 'it failure$',
        });

        expect(path.join(this.outputDir, 'failure artifacts it failure.png')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts it failure.html')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts it failure.browser.txt')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts it failure.driver.txt')).to.be.a.file();

        expect(stats.tests).to.equal(1);
        expect(stats.failures).to.equal(1);
      });

      it('doesn\'t make artifacts on test success', async function() {
        let stats = await this.runTests({
          filter: 'it success$',
        });

        expect(this.outputDir).to.be.a.directory().and.empty;

        expect(stats.tests).to.equal(1);
        expect(stats.passes).to.equal(1);
      });

      it(`handles errors in ${failureArtifacts.name}`, async function() {
        let promise = this.runTests({
          filter: `it ${failureArtifacts.name} error failure$`,
        });

        await expect(promise).to.eventually.be.rejectedWith('test $ error');

        expect(this.outputDir).to.be.a.directory().and.empty;
      });

      it('prevents "stale element reference" errors', async function() {
        let stats = await this.runTests({
          filter: 'it prevent stale ',
        });

        expect(path.join(this.outputDir, 'failure artifacts it prevent stale failure.png')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts it prevent stale failure.html')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts it prevent stale failure.browser.txt')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts it prevent stale failure.driver.txt')).to.be.a.file();

        expect(stats.tests).to.equal(2);
        expect(stats.failures).to.equal(1);
      });

      it('handles errors in beforeEach', async function() {
        let stats = await this.runTests({
          filter: 'beforeEach failure$',
        });

        expect(path.join(this.outputDir, 'failure artifacts beforeEach !before each! hook for !failure.png')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts beforeEach !before each! hook for !failure.html')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts beforeEach !before each! hook for !failure.browser.txt')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts beforeEach !before each! hook for !failure.driver.txt')).to.be.a.file();

        expect(stats.tests).to.equal(0);
        expect(stats.failures).to.equal(1);
      });

      it('handles errors in before', async function() {
        let stats = await this.runTests({
          filter: 'before with browser failure$',
        });

        expect(path.join(this.outputDir, 'failure artifacts before with browser !before all! hook for !failure.png')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts before with browser !before all! hook for !failure.html')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts before with browser !before all! hook for !failure.browser.txt')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts before with browser !before all! hook for !failure.driver.txt')).to.be.a.file();

        expect(stats.tests).to.equal(0);
        expect(stats.failures).to.equal(1);
      });

      it('doesn\'t make artifacts if no browser', async function() {
        let stats = await this.runTests({
          filter: 'before without browser failure$',
        });

        expect(this.outputDir).to.be.a.directory().and.empty;

        expect(stats.tests).to.equal(0);
        expect(stats.failures).to.equal(1);
      });

      it('handles errors in afterEach', async function() {
        let stats = await this.runTests({
          filter: 'afterEach failure$',
        });

        expect(path.join(this.outputDir, 'failure artifacts afterEach !after each! hook for !failure.png')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts afterEach !after each! hook for !failure.html')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts afterEach !after each! hook for !failure.browser.txt')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts afterEach !after each! hook for !failure.driver.txt')).to.be.a.file();

        expect(stats.tests).to.equal(1);
        expect(stats.failures).to.equal(1);
      });

      it('handles errors in after', async function() {
        let stats = await this.runTests({
          filter: 'after failure$',
        });

        expect(path.join(this.outputDir, 'failure artifacts after !after all! hook for !failure.png')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts after !after all! hook for !failure.html')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts after !after all! hook for !failure.browser.txt')).to.be.a.file();
        expect(path.join(this.outputDir, 'failure artifacts after !after all! hook for !failure.driver.txt')).to.be.a.file();

        expect(stats.tests).to.equal(1);
        expect(stats.failures).to.equal(1);
      });
    });

    describe('dry run', function() {
      before(function() {
        globs = [path.join(fixturesPath, 'dry-run-test.js')];
      });

      it('works', async function() {
        let stats = await this.runTests({
          dryRun: true,
        });

        expect(stats.pending).to.equal(1);
      });
    });
  });
});
