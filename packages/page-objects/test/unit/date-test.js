'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const {
  encodeString,
  getOriginalString,
  isInRange,
  shouldPurge,
} = require('../../src/helpers/date');
const sinon = require('sinon');

describe(function() {
  beforeEach(function() {
    this.sandbox = sinon.createSandbox();
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  it('encodes a string', function() {
    let name = 'test-name';

    let encoded = encodeString(name);

    expect(encoded).to.not.equal(name);
  });

  it('can retrieve the original string', function() {
    let name = 'test-name';

    let encoded = encodeString(name);

    let original = getOriginalString(encoded);

    expect(original).to.equal(name);
  });

  it('parses the date', function() {
    let name = 'test-name';

    let encoded = encodeString(name);

    expect(() => isInRange(encoded)).to.not.throw;
  });

  it('is in range', function() {
    let name = 'test-name';

    let encoded = encodeString(name);

    expect(isInRange(encoded)).to.be.true;
  });

  it('can force out of range', function() {
    let name = 'test-name';

    let encoded = encodeString(name, true);

    expect(isInRange(encoded)).to.be.false;
  });

  it('is not in range', function() {
    let name = 'test-name';

    this.sandbox.useFakeTimers(new Date().getTime() - 60 * 60 * 1000);

    let encoded = encodeString(name);

    this.sandbox.restore();

    expect(isInRange(encoded, 30 * 60 * 1000)).to.be.false;
  });

  it('should throw if name is not encoded', function() {
    let name = 'test-name';

    let oldEncoded = encodeString(name);

    expect(() => shouldPurge(oldEncoded, ['not-encoded'])).to.throw('"not-encoded" is not a key in the map.');
  });

  it('should not purge if name mismatch', function() {
    let name = 'test-name';

    let oldEncoded = encodeString(name);

    let newEncoded = encodeString('mismatch');

    expect(shouldPurge(oldEncoded, [newEncoded])).to.be.false;
  });

  it('should not purge if match and in range', function() {
    let name = 'test-name';

    let oldEncoded = encodeString(name);

    let newEncoded = encodeString(name);

    expect(shouldPurge(oldEncoded, [newEncoded])).to.be.false;
  });

  it('should purge if match and not in range', function() {
    let name = 'test-name';

    this.sandbox.useFakeTimers(new Date().getTime() - 60 * 60 * 1000);

    let oldEncoded = encodeString(name);

    this.sandbox.restore();

    let newEncoded = encodeString(name);

    expect(shouldPurge(oldEncoded, [newEncoded], 30 * 60 * 1000)).to.be.true;
  });
});
