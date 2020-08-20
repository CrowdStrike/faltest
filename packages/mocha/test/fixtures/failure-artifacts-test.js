'use strict';

const assert = require('assert');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle');
const failureArtifacts = require('../../src/failure-artifacts');
const sinon = require('sinon');

describe('failure artifacts', function() {
  afterEach(function() {
    sinon.restore();
  });

  describe('it', function() {
    setUpWebDriver.call(this);

    it('failure', function() {
      assert.ok(false);
    });

    it('success', function() {
      assert.ok(true);
    });

    describe(`${failureArtifacts.name} error`, function() {
      let $;

      beforeEach(function() {
        $ = sinon.stub(this.browser, '$').rejects(new Error('test $ error'));
      });

      after(function() {
        expect($).to.have.been.called;
      });

      it('failure', function() {
        assert.ok(false);
      });
    });

    describe('prevent stale', function() {
      beforeEach(async function() {
        await this.browser.url('https://webdriver.io');
      });

      it('failure', function() {
        assert.ok(false);
      });

      it('success', function() {
        assert.ok(true);
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
