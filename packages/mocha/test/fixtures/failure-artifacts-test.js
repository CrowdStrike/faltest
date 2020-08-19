'use strict';

const assert = require('assert');
const { setUpWebDriver } = require('../../../lifecycle');

describe('failure artifacts', function() {
  describe('it', function() {
    setUpWebDriver.call(this);

    it('failure', function() {
      assert.ok(false);
    });

    it('success', function() {
      assert.ok(true);
    });
  });

  describe('beforeEach', function() {
    setUpWebDriver.call(this);

    beforeEach(function() {
      assert.ok(false);
    });

    it('failure', function() {});
  });

  describe('before', function() {
    describe('with browser', function() {
      setUpWebDriver.call(this, {
        shareWebdriver: true,
        keepBrowserOpen: true,
      });

      before(function() {
        assert.ok(false);
      });

      it('failure', function() {});
    });

    describe('without browser', function() {
      setUpWebDriver.call(this);

      before(function() {
        assert.ok(false);
      });

      it('failure', function() {});
    });
  });

  describe('afterEach', function() {
    setUpWebDriver.call(this);

    afterEach(function() {
      assert.ok(false);
    });

    it('failure', function() {
      assert.ok(true);
    });
  });

  describe('after', function() {
    setUpWebDriver.call(this);

    after(function() {
      assert.ok(false);
    });

    it('failure', function() {
      assert.ok(true);
    });
  });
});
