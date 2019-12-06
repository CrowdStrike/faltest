'use strict';

const assert = require('assert');

describe('tag', function() {
  it('test with no tag', function() {
    assert.ok(true);
  });

  it('test with a tag #tag1', function() {
    assert.ok(true);
  });

  it('test with a tag #tag-2', function() {
    assert.ok(true);
  });

  it('test with a tag #tagC', function() {
    assert.ok(true);
  });

  it('test with a tag that is a substring of other tags #tag', function() {
    assert.ok(true);
  });
});
