'use strict';

const assert = require('assert');
const { setUpWebDriver } = require('../../../lifecycle');

describe('failure artifacts', function() {
  setUpWebDriver.call(this);

  describe('it', function() {
    it('failure', function() {
      assert.ok(false);
    });

    it('success', function() {
      assert.ok(true);
    });
  });

  describe('beforeEach', function() {
    beforeEach(function() {
      assert.ok(false);
    });

    it('failure', function() {});
  });
});
