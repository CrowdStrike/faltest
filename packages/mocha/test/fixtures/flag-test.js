'use strict';

const assert = require('assert');
const { createFlaggedTest, createFlaggedDescribe } = require('../../src');

const it = createFlaggedTest(global, ['flag1']);
const describe = createFlaggedDescribe(global, ['flag1']);

describe('flag - it', function() {
  it({
    name: 'test with a flag',
    flags: ['flag1'],
  }, function() {
    assert.ok(true);
  });

  it({
    name: 'test with an inverted flag',
    flags: ['!flag1'],
  }, function() {
    assert.ok(true);
  });

  it({
    name: 'test with a missing flag',
    flags: ['flag2'],
  }, function() {
    assert.ok(true);
  });
});

describe('flag - describe', function() {
  describe({
    name: 'test with a flag',
    flags: ['flag1'],
  }, function () {
    it('works', function () {
      assert.ok(true);
    });
  });

  describe({
    name: 'test with an inverted flag',
    flags: ['!flag1'],
  }, function () {
    it('works', function () {
      assert.ok(true);
    });
  });

  describe({
    name: 'test with a missing flag',
    flags: ['flag2'],
  }, function () {
    it('works', function () {
      assert.ok(true);
    });
  });
});
