'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const sinon = require('sinon');
const cp = require('child_process');
const clearModule = require('clear-module');

describe(function() {
  let sandbox;
  let exec;
  let getMajorVersion;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    exec = sandbox.stub(cp, 'exec');

    clearModule('../../src/chrome');
    getMajorVersion = require('../../src/chrome').getMajorVersion;
  });

  afterEach(function() {
    sandbox.restore();
  });

  it(require('../../src/chrome').getMajorVersion, async function() {
    // trailing space is needed for an accurate test
    exec.callsArgWith(1, null, { stdout: `Google Chrome 65.0.3325.181
` });

    let version = await getMajorVersion();

    expect(version).to.equal('65');
  });
});
