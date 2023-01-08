'use strict';

const assert = require('assert');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle');
const failureArtifacts = require('../../src/failure-artifacts');
const sinon = require('sinon');
const Server = require('../../../../helpers/server');

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
      let takeScreenshot;

      beforeEach(function() {
        takeScreenshot = sinon
          .stub(this.browser._browser, 'takeScreenshot')
          .rejects(new Error('test takeScreenshot error'));
      });

      after(function() {
        expect(takeScreenshot).to.have.been.called;
      });

      it('failure', function() {
        assert.ok(false);
      });
    });

    describe('prevent stale', function() {
      beforeEach(async function() {
        this.server = new Server();

        let port = await this.server.start();

        await this.browser.url(`http://localhost:${port}`);
      });

      afterEach(async function() {
        if (this.server) {
          await this.server.stop();
        }
      });

      it('failure', function() {
        assert.ok(false);
      });

      it('success', function() {
        assert.ok(true);
      });
    });

    it('retries', function() {
      assert.ok(this.test.currentRetry() === 2);
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
