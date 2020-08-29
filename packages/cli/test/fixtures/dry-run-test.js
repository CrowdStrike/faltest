'use strict';

const assert = require('assert');

describe('dry run', function() {
  it('failure isn\'t run', function() {
    assert.ok(false);
  });
});
