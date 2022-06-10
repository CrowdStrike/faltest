'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const _run = require('../helpers/run');
const path = require('path');

const examplesPath = path.resolve(__dirname, '../examples');

describe(function() {
  before(function() {
    this.run = async function run() {
      return await _run(this.test.title, {
        cwd: path.join(examplesPath, this.test.parent.title),
      });
    };
  });

  describe('custom-cli', function() {
    it('yarn start', async function() {
      this.timeout(60e3);

      let output = await this.run();

      expect(output).to.include(' 1 passing');
    });
  });

  describe('full-suite', function() {
    this.timeout(60e3);

    it('yarn start --target fixtures --env dev --tag user --tag smoke', async function() {
      let output = await this.run();

      expect(output).to.include(' 1 passing');
      expect(output).to.not.include(' pending');
    });

    it('yarn start --tag admin --tag !smoke', async function() {
      let output = await this.run();

      expect(output).to.include(' 2 passing');
      expect(output).to.include(' 1 pending');
    });

    it('yarn start --tag admin --filter unfinished', async function() {
      let output = await this.run();

      expect(output).to.include(' 1 passing');
      expect(output).to.not.include(' pending');
    });
  });

  describe('lifecycle-only', function() {
    it('yarn start', async function() {
      this.timeout(30e3);

      let output = await this.run();

      expect(output).to.include(' 1 passing');
    });
  });

  describe('multiple-browsers', function() {
    it('yarn start', async function() {
      this.timeout(30e3);

      let output = await this.run();

      expect(output).to.include(' 1 passing');
    });
  });

  describe('runner-only', function() {
    it('yarn start', async function() {
      this.timeout(30e3);

      let output = await this.run();

      expect(output).to.include(' 1 passing');
    });
  });
});
