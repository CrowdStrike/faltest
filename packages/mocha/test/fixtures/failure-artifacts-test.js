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

    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip('it.skip', function() {
      assert.ok(false);
    });

    it('this.skip', function() {
      this.skip();
    });
  });

  describe('beforeEach', function() {
    beforeEach(function() {
      assert.ok(false);
    });

    it('failure', function() {});
  });
});
