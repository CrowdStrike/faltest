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
    this.timeout(30e3);

    let output = await this.run();

    expect(output).to.include(' 1 passing');
  });

  it('cross-env FORCE_COLOR=1 mocha fixtures/redact-password-test.js --exit', async function() {
    this.timeout(60e3);

    let output = await this.run();

    expect(output).to.include(' 4 passing');
  });

  // more permissive log level
  it('cross-env LOG_LEVEL=trace mocha fixtures/redact-password-test.js --exit', async function() {
    this.timeout(60e3);

    let output = await this.run();

    expect(output).to.include(' 4 passing');
  });

  // without colors
  it('cross-env FORCE_COLOR=0 mocha fixtures/redact-password-test.js --exit', async function() {
    this.timeout(60e3);

    let output = await this.run();

    expect(output).to.include(' 4 passing');
  });
});
