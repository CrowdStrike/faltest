'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const path = require('path');
const clearModule = require('clear-module');
const { runTests } = require('../../src');

describe(function() {
  describe(runTests, function() {
    let globs;

    afterEach(function() {
      // unfortunately, mocha caches previously run files,
      // even though it is a new instance...
      // https://github.com/mochajs/mocha/blob/v6.2.0/lib/mocha.js#L334
      clearModule.all();
    });

    describe('tags', function() {
      before(function() {
        globs = [path.resolve(__dirname, '../fixtures/tag-test.js')];
      });

      it('works', async function() {
        let stats = await runTests({
          globs,
        });

        expect(stats.passes).to.equal(3);
      });

      it('works with a tag', async function() {
        let stats = await runTests({
          globs,
          tag: ['tag1'],
        });

        expect(stats.passes).to.equal(1);
      });

      it('works with an inverted tag', async function() {
        let stats = await runTests({
          globs,
          tag: ['!tag1'],
        });

        expect(stats.passes).to.equal(2);
      });

      it('works with a filter', async function() {
        let stats = await runTests({
          globs,
          filter: '#tag1',
        });

        expect(stats.passes).to.equal(1);
      });
    });

    describe('roles', function() {
      before(function() {
        globs = [path.resolve(__dirname, '../fixtures/role-test.js')];
      });

      it('works', async function() {
        let stats = await runTests({
          globs,
        });

        expect(stats.passes).to.equal(3);
      });

      it('works with a role', async function() {
        let stats = await runTests({
          globs,
          tag: ['role1'],
        });

        expect(stats.passes).to.equal(1);
      });

      it('works with an inverted role', async function() {
        let stats = await runTests({
          globs,
          tag: ['!role1'],
        });

        expect(stats.passes).to.equal(2);
      });
    });

    describe('feature flags', function() {
      before(function() {
        globs = [path.resolve(__dirname, '../fixtures/flag-test.js')];
      });

      it('works', async function() {
        let stats = await runTests({
          globs,
        });

        expect(stats.passes).to.equal(1);
      });
    });
  });
});
