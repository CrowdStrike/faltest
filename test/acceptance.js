'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const execa = require('execa');

describe(function() {
  before(function() {
    this.run = async function run() {
      try {
        let { stdout } = await execa.command(this.test.title);

        return stdout;
      } catch (err) {
        return err.stdout;
      }
    };
  });

  it('faltest --retries 1 fixtures/retries-test.js', async function() {
    this.timeout(30 * 1000);

    let output = await this.run();

    expect(output).to.include(' 1 passing');
  });
});
