'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const path = require('path');
const { runTests: _runTests } = require('../../src');
const { promisify } = require('util');
const createTmpDir = promisify(require('tmp').dir);
const failureArtifacts = require('../../src/failure-artifacts');

const fixturesPath = path.resolve(__dirname, '../fixtures');

describe(function() {
  describe(_runTests, function() {
    this.timeout(30e3);

    let globs;

    before(function() {
      this.runTests = async options => {
        return await _runTests({
          globs,
          reporter: path.join(fixturesPath, 'null-reporter.js'),
          ...options,
        });
      };
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
        this.output = path.join(await createTmpDir(), 'output-test');
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

        let extensions = ['png', 'html', 'browser.txt', 'driver.txt'];

        let getFilePath = (title, attempt, ext) => {
          return path.join(this.outputDir, `${title}.${attempt}.${ext}`);
        };

        let { runTests } = this;
        Object.assign(this, {
          async runTests(options) {
            return await runTests({
              failureArtifacts: true,
              failureArtifactsOutputDir: this.outputDir,
              ...options,
            });
          },
          assertFilesExist(title, attempt = 1) {
            for (let ext of extensions) {
              expect(getFilePath(title, attempt, ext)).to.be.a.file();
            }
          },
          assertFilesDontExist(title, attempt = 1) {
            for (let ext of extensions) {
              expect(getFilePath(title, attempt, ext)).to.not.be.a.path();
            }
          },
          assertEmptyDir() {
            expect(this.outputDir).to.be.a.directory().and.empty;
          },
        });
      });

      beforeEach(async function() {
        this.outputDir = await createTmpDir();
      });

      it('works', async function() {
        let stats = await this.runTests({
          filter: 'it failure$',
        });

        this.assertFilesExist('failure artifacts it failure');

        expect(stats.tests).to.equal(1);
        expect(stats.failures).to.equal(1);
      });

      it('doesn\'t make artifacts on test success', async function() {
        let stats = await this.runTests({
          filter: 'it success$',
        });

        this.assertEmptyDir();

        expect(stats.tests).to.equal(1);
        expect(stats.passes).to.equal(1);
      });

      it(`handles errors in ${failureArtifacts.name}`, async function() {
        let promise = this.runTests({
          filter: `it ${failureArtifacts.name} error failure$`,
        });

        await expect(promise).to.eventually.be.rejectedWith('test takeScreenshot error');

        this.assertEmptyDir();
      });

      it('prevents "stale element reference" errors', async function() {
        let stats = await this.runTests({
          filter: 'it prevent stale ',
        });

        this.assertFilesExist('failure artifacts it prevent stale failure');

        expect(stats.tests).to.equal(2);
        expect(stats.failures).to.equal(1);
      });

      it('handles errors in beforeEach', async function() {
        let stats = await this.runTests({
          filter: 'beforeEach failure$',
        });

        this.assertFilesExist('failure artifacts beforeEach !before each! hook for !failure');

        expect(stats.tests).to.equal(0);
        expect(stats.failures).to.equal(1);
      });

      it('handles errors in before', async function() {
        let stats = await this.runTests({
          filter: 'before with browser failure$',
        });

        this.assertFilesExist('failure artifacts before with browser !before all! hook for !failure');

        expect(stats.tests).to.equal(0);
        expect(stats.failures).to.equal(1);
      });

      it('doesn\'t make artifacts if no browser', async function() {
        let stats = await this.runTests({
          filter: 'before without browser failure$',
        });

        this.assertEmptyDir();

        expect(stats.tests).to.equal(0);
        expect(stats.failures).to.equal(1);
      });

      it('handles errors in afterEach', async function() {
        let stats = await this.runTests({
          filter: 'afterEach failure$',
        });

        this.assertFilesExist('failure artifacts afterEach !after each! hook for !failure');

        expect(stats.tests).to.equal(1);
        expect(stats.failures).to.equal(1);
      });

      it('handles errors in after', async function() {
        let stats = await this.runTests({
          filter: 'after failure$',
        });

        this.assertFilesExist('failure artifacts after !after all! hook for !failure');

        expect(stats.tests).to.equal(1);
        expect(stats.failures).to.equal(1);
      });

      it('handles retries', async function() {
        let retries = 2;

        let stats = await this.runTests({
          filter: 'it retries$',
          retries,
        });

        let title = 'failure artifacts it retries';

        for (let attempt = 1; attempt <= retries; attempt++) {
          this.assertFilesExist(title, attempt);
        }

        for (let attempt of [0, retries + 1]) {
          this.assertFilesDontExist(title, attempt);
        }

        expect(stats.tests).to.equal(1);
        expect(stats.failures).to.equal(0);
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
