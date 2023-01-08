'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const path = require('path');
const { runTests: _runTests } = require('../../src');
const { promisify } = require('util');
const createTmpDir = promisify(require('tmp').dir);
const failureArtifacts = require('../../src/failure-artifacts');
const sinon = require('sinon');

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

        let getFileNames = (title, attempt = 1) => {
          return extensions.map(ext => `failure artifacts ${title}.${attempt}.${ext}`);
        };

        let { runTests } = this;
        Object.assign(this, {
          runTests: async options => {
            return await runTests.call(this, {
              failureArtifacts: true,
              failureArtifactsOutputDir: this.outputDir,
              ...options,
            });
          },
          assertFilesExist(title, attempt) {
            expect(this.outputDir).to.be.a.directory().and.include.files(getFileNames(title, attempt));
          },
          assertFilesDontExist(title, attempt) {
            expect(this.outputDir).to.be.a.directory().and.not.have.contents(getFileNames(title, attempt));
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

        expect(stats).matches(sinon.match({
          tests: 1,
          failures: 1,
        }));

        this.assertFilesExist('it failure');
      });

      it('doesn\'t make artifacts on test success', async function() {
        let stats = await this.runTests({
          filter: 'it success$',
        });

        expect(stats).matches(sinon.match({
          tests: 1,
          passes: 1,
        }));

        this.assertEmptyDir();
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

        expect(stats).matches(sinon.match({
          tests: 2,
          failures: 1,
        }));

        this.assertFilesExist('it prevent stale failure');
      });

      it('handles errors in beforeEach', async function() {
        let stats = await this.runTests({
          filter: 'beforeEach failure$',
        });

        expect(stats).matches(sinon.match({
          tests: 0,
          failures: 1,
        }));

        this.assertFilesExist('beforeEach !before each! hook for !failure');
      });

      it('handles errors in before', async function() {
        let stats = await this.runTests({
          filter: 'before with browser failure$',
        });

        expect(stats).matches(sinon.match({
          tests: 0,
          failures: 1,
        }));

        this.assertFilesExist('before with browser !before all! hook for !failure');
      });

      it('doesn\'t make artifacts if no browser', async function() {
        let stats = await this.runTests({
          filter: 'before without browser failure$',
        });

        expect(stats).matches(sinon.match({
          tests: 0,
          failures: 1,
        }));

        this.assertEmptyDir();
      });

      it('handles errors in afterEach', async function() {
        let stats = await this.runTests({
          filter: 'afterEach failure$',
        });

        expect(stats).matches(sinon.match({
          tests: 1,
          failures: 1,
        }));

        this.assertFilesExist('afterEach !after each! hook for !failure');
      });

      it('handles errors in after', async function() {
        let stats = await this.runTests({
          filter: 'after failure$',
        });

        expect(stats).matches(sinon.match({
          tests: 1,
          failures: 1,
        }));

        this.assertFilesExist('after !after all! hook for !failure');
      });

      it('handles retries', async function() {
        let retries = 2;

        let stats = await this.runTests({
          filter: 'it retries$',
          retries,
        });

        expect(stats).matches(sinon.match({
          tests: 1,
          failures: 0,
        }));

        let title = 'it retries';

        for (let attempt = 1; attempt <= retries; attempt++) {
          this.assertFilesExist(title, attempt);
        }

        for (let attempt of [0, retries + 1]) {
          this.assertFilesDontExist(title, attempt);
        }
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
