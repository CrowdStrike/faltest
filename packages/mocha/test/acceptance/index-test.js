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

        let { runTests } = this;
        Object.assign(this, {
          runTests: async options => {
            return await runTests.call(this, {
              failureArtifacts: true,
              failureArtifactsOutputDir: this.outputDir,
              ...options,
            });
          },
          extensions: ['png', 'html', 'url.txt', 'browser.txt', 'driver.txt', 'error.txt'],
          getFileNames(title, attempt = 1) {
            return this.extensions.map(ext => `failure artifacts ${title}.${attempt}.${ext}`);
          },
          assertFilesExist(title, attempt) {
            expect(this.outputDir).to.be.a.directory().and.include.files(this.getFileNames(title, attempt));
          },
          assertFilesDontExist(title, attempt) {
            expect(this.outputDir).to.be.a.directory().and.not.have.contents(this.getFileNames(title, attempt));
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
          filter: 'it chrome failure$',
        });

        expect(stats).matches(sinon.match({
          tests: 1,
          failures: 1,
        }));

        this.assertFilesExist('it chrome failure');
      });

      it('doesn\'t make artifacts on test success', async function() {
        let stats = await this.runTests({
          filter: 'it chrome success$',
        });

        expect(stats).matches(sinon.match({
          tests: 1,
          passes: 1,
        }));

        this.assertEmptyDir();
      });

      it(`handles errors in ${failureArtifacts.name}`, async function() {
        let promise = this.runTests({
          filter: `it chrome ${failureArtifacts.name} error failure$`,
        });

        await expect(promise).to.eventually.be.rejectedWith('test takeScreenshot error');

        this.assertEmptyDir();
      });

      it('prevents "stale element reference" errors', async function() {
        let stats = await this.runTests({
          filter: 'it chrome prevent stale ',
        });

        expect(stats).matches(sinon.match({
          tests: 2,
          failures: 1,
        }));

        this.assertFilesExist('it chrome prevent stale failure');
      });

      it('handles errors in beforeEach', async function() {
        let stats = await this.runTests({
          filter: 'beforeEach without mocha-helpers failure$',
        });

        expect(stats).matches(sinon.match({
          tests: 0,
          failures: 1,
        }));

        this.assertFilesExist('beforeEach without mocha-helpers !before each! hook for !failure!');
      });

      it('handles errors in before', async function() {
        let stats = await this.runTests({
          filter: 'before with browser without mocha-helpers failure$',
        });

        expect(stats).matches(sinon.match({
          tests: 0,
          failures: 1,
        }));

        this.assertFilesExist('before with browser without mocha-helpers !before all! hook for !failure!');
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
          filter: 'afterEach without mocha-helpers failure$',
        });

        expect(stats).matches(sinon.match({
          tests: 1,
          failures: 1,
        }));

        this.assertFilesExist('afterEach without mocha-helpers !after each! hook for !failure!');
      });

      it('handles errors in after', async function() {
        let stats = await this.runTests({
          filter: 'after without mocha-helpers failure$',
        });

        expect(stats).matches(sinon.match({
          tests: 1,
          failures: 1,
        }));

        this.assertFilesExist('after without mocha-helpers !after all! hook for !failure!');
      });

      // eslint-disable-next-line mocha/no-skipped-tests
      it.skip('works in firefox', async function() {
        let stats = await this.runTests({
          filter: 'it firefox ',
        });

        expect(stats).matches(sinon.match({
          tests: 2,
          failures: 1,
          passes: 1,
        }));

        this.extensions = ['png', 'html', 'url.txt'];

        this.assertFilesExist('it firefox failure');
      });

      it('works in edge', async function() {
        let stats = await this.runTests({
          filter: 'it edge ',
        });

        expect(stats).matches(sinon.match({
          tests: 2,
          failures: 1,
          passes: 1,
        }));

        this.extensions = ['png', 'html', 'url.txt'];

        this.assertFilesExist('it edge failure');
      });

      describe('retries', function() {
        const retries = 2;

        before(function() {
          let { runTests } = this;
          Object.assign(this, {
            runTests: async ({
              filter,
              title,
            }) => {
              let stats = await runTests.call(this, {
                filter,
                retries,
              });

              expect(stats).matches(sinon.match({
                tests: 1,
                failures: 0,
              }));

              for (let attempt = 1; attempt <= retries; attempt++) {
                this.assertFilesExist(title, attempt);
              }

              for (let attempt of [0, retries + 1]) {
                this.assertFilesDontExist(title, attempt);
              }
            },
          });
        });

        it('before', async function() {
          await this.runTests({
            filter: 'before with browser retries failure$',
            title: 'before with browser retries !before all! hook for !failure!',
          });
        });

        it('beforeEach', async function() {
          await this.runTests({
            filter: 'beforeEach retries failure$',
            title: 'beforeEach retries !before each! hook for !failure!',
          });
        });

        it('it', async function() {
          await this.runTests({
            filter: 'it chrome retries$',
            title: 'it chrome retries',
          });
        });

        it('afterEach', async function() {
          await this.runTests({
            filter: 'afterEach retries failure$',
            title: 'afterEach retries !after each! hook for !failure!',
          });
        });

        it('after', async function() {
          await this.runTests({
            filter: 'after retries failure$',
            title: 'after retries !after all! hook for !failure!',
          });
        });
      });

      it('handles long test names', async function() {
        let stats = await this.runTests({
          filter: 'it chrome This is a really long test name This is a really long test name This is a really long test name This is a really long test name$',
        });

        expect(stats).matches(sinon.match({
          tests: 1,
          failures: 1,
        }));

        this.assertFilesExist('it chrome This is a really long test name This is a really long test name This is a really long test name This is a really long test');
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
