'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const _run = require('../helpers/run');

describe(function() {
  before(function() {
    this.run = async function run() {
      return await _run(this.test.title);
    };
  });

  it('faltest --retries 1 fixtures/retries-test.js', async function() {
    this.timeout(30 * 1000);

    let output = await this.run();

    expect(output).to.include(' 1 passing');
  });
});
