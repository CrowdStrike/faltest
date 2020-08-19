'use strict';

const assert = require('assert');
const { setUpWebDriver } = require('../../../lifecycle');

describe('failure artifacts', function() {
  describe('it', function() {
    describe('normal', function() {
      setUpWebDriver.call(this);

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

    describe('`after` order', function() {
      setUpWebDriver.call(this);

      it('success', function() {
        assert.ok(true);
      });

      // `after`'s `currentTest` will be this, ever though
      // it was filtered out and never run...
      it('failure', function() {
        assert.ok(false);
      });
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
});
