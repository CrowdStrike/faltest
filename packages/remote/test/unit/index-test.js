'use strict';

const { describe, setUpObjectReset } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const sinon = require('sinon');
const remote = require('../../src');
const EventEmitter = require('events');

const {
  killOrphans,
  startWebDriver,
  spawnWebDriver,
  startBrowser,
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
    setUpObjectReset(process.env);

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

    it('throws if unexpected name', async function() {
      process.env.WEBDRIVER_DISABLE_CLEANUP = true;

      let promise = startWebDriver({
        overrides: {
          browser: 'unknown',
        },
      });

      await expect(promise).to.eventually.be.rejectedWith('Browser "unknown" not implemented.');
    });
  });

  describe(spawnWebDriver, function() {
    it('throws if unexpected name', async function() {
      sinon.stub(remote, 'spawn');

      let promise = spawnWebDriver('unknown');

      await expect(promise).to.eventually.be.rejectedWith('Driver "unknown" not implemented.');
    });
  });

  describe(startBrowser, function() {
    it('throws if unexpected name', async function() {
      let promise = startBrowser({
        overrides: {
          browser: 'unknown',
        },
      });

      await expect(promise).to.eventually.be.rejectedWith('Browser "unknown" not implemented.');
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
