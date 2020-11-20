'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const _run = require('../helpers/run');
const path = require('path');

function getCwd(example) {
  return path.resolve(__dirname, '../examples', example);
}

describe(function() {
  before(function() {
    this.run = async function run() {
      return await _run(this.test.title, {
        cwd: this.test.parent.title,
      });
    };
  });

  describe(getCwd('custom-cli'), function() {
    it('yarn start', async function() {
      this.timeout(30e3);

      let output = await this.run();

      expect(output).to.include(' 1 passing');
    });
  });

  describe(getCwd('full-suite'), function() {
    this.timeout(30e3);

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

  describe(getCwd('lifecycle-only'), function() {
    it('yarn start', async function() {
      this.timeout(30e3);

      let output = await this.run();

      expect(output).to.include(' 1 passing');
    });
  });

  describe(getCwd('multiple-browsers'), function() {
    it('yarn start', async function() {
      this.timeout(30e3);

      let output = await this.run();

      expect(output).to.include(' 1 passing');
    });
  });

  describe(getCwd('runner-only'), function() {
    it('yarn start', async function() {
      this.timeout(30e3);

      let output = await this.run();

      expect(output).to.include(' 1 passing');
    });
  });
});
