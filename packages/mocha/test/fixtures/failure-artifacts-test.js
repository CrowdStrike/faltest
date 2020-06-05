'use strict';

const assert = require('assert');
const { createFailureArtifactsHelpers } = require('../../src');
const { setUpWebDriver } = require('../../../lifecycle');

Object.assign(global, createFailureArtifactsHelpers(global));

describe('failure artifacts', function() {
  setUpWebDriver.call(this);

  it('failure', function() {
    assert.ok(false);
  });

  it('success', function() {
    assert.ok(true);
  });
});
