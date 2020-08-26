'use strict';

const assert = require('assert');
const { createFlaggedTest } = require('../../src');

const it = createFlaggedTest(global, ['flag1']);

describe('flag', function() {
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
