'use strict';

const assert = require('assert');
const { setUpWebDriver } = require('../../../lifecycle');

describe('failure artifacts', function() {
  setUpWebDriver.call(this);

  it('failure', function() {
    assert.ok(false);
  });

  it('success', function() {
    assert.ok(true);
  });
});
