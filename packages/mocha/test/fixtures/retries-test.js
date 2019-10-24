'use strict';

const assert = require('assert');

describe('retries', function() {
  before(function() {
    this.attempt = 0;
  });

  it('works', function() {
    assert.strictEqual(++this.attempt, 2);
  });
});
