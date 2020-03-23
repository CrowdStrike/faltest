'use strict';

const { describe } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const sinon = require('sinon');
const remote = require('../../src');
const EventEmitter = require('events');

const {
  killOrphans,
  startWebDriver,
  stopWebDriver,
  stopBrowser,
} = remote;

describe(function() {
  afterEach(function() {
    sinon.restore();
  });

  describe(killOrphans, function() {
    it('handles processes that died before the kill', async function() {
      let pid = 123;
      sinon.stub(remote, 'psList').resolves([{ name: 'chromedriver', pid }]);
      let fkill = sinon.stub(remote, 'fkill').withArgs(pid).rejects(new Error('Process doesn\'t exist'));

      await expect(killOrphans()).to.eventually.be.fulfilled;

      expect(fkill).to.have.been.calledOnce;
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip('throws if kill fails for another reason', async function() {
      let pid = 123;
      let error = new Error('another reason');
      sinon.stub(remote, 'psList').resolves([{ name: 'chromedriver', pid }]);
      let fkill = sinon.stub(remote, 'fkill').withArgs(pid).rejects(error);

      await expect(killOrphans()).to.eventually.be.rejectedWith(error);

      expect(fkill).to.have.been.calledOnce;
    });
  });

  describe(startWebDriver, function() {
    let revertProcessEnv;

    beforeEach(function() {
      if ('WEBDRIVER_DISABLE_CLEANUP' in process.env) {
        let WEBDRIVER_DISABLE_CLEANUP = process.env.WEBDRIVER_DISABLE_CLEANUP;
        revertProcessEnv = () => {
          process.env.WEBDRIVER_DISABLE_CLEANUP = WEBDRIVER_DISABLE_CLEANUP;
        };
      } else {
        revertProcessEnv = () => {
          delete process.env.WEBDRIVER_DISABLE_CLEANUP;
        };
      }
    });

    afterEach(function() {
      revertProcessEnv();
    });

    it('cleans up browsers', async function() {
      let killOrphans = sinon.stub(remote, 'killOrphans');

      let webDriver = new EventEmitter();
      sinon.stub(remote, 'spawnWebDriver').resolves(webDriver);

      await startWebDriver();

      expect(killOrphans).to.be.calledOnce;

      expect(webDriver.eventNames()).to.deep.equal(['exit']);
      expect(webDriver.listeners('exit')).to.deep.equal([killOrphans]);
    });

    it('doesn\'t clean up browsers if disabled', async function() {
      process.env.WEBDRIVER_DISABLE_CLEANUP = true;

      let killOrphans = sinon.stub(remote, 'killOrphans');

      let webDriver = new EventEmitter();
      sinon.stub(remote, 'spawnWebDriver').resolves(webDriver);

      await startWebDriver();

      expect(killOrphans).to.not.be.called;

      expect(webDriver.eventNames()).to.deep.equal([]);
    });
  });

  describe(stopWebDriver, function() {
    it('ignores null', async function() {
      await expect(stopWebDriver(null)).to.eventually.be.fulfilled;
    });
  });

  describe(stopBrowser, function() {
    it('ignores null', async function() {
      await expect(stopBrowser(null)).to.eventually.be.fulfilled;
    });
  });
});
