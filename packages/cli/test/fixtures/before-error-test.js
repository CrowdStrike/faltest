'use strict';

const assert = require('assert');

describe('before error', function() {
  before(function() {
    throw new Error('thrown error in before hook');
  });

  it('works', function() {
    assert.ok(true);
  });
});
