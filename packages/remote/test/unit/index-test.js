'use strict';

const { describe } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const sinon = require('sinon');
const webDriver = require('../../src');

const {
  killOrphans,
  stopWebDriver,
  stopBrowser,
} = webDriver;

describe(function() {
  describe(killOrphans, function() {
    afterEach(function() {
      sinon.restore();
    });

    it('handles processes that died before the kill', async function() {
      let pid = 123;
      sinon.stub(webDriver, 'psList').resolves([{ name: 'chromedriver', pid }]);
      let fkill = sinon.stub(webDriver, 'fkill').withArgs(pid).rejects(new Error('Process doesn\'t exist'));

      await expect(killOrphans()).to.eventually.be.fulfilled;

      expect(fkill).to.have.been.calledOnce;
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip('throws if kill fails for another reason', async function() {
      let pid = 123;
      let error = new Error('another reason');
      sinon.stub(webDriver, 'psList').resolves([{ name: 'chromedriver', pid }]);
      let fkill = sinon.stub(webDriver, 'fkill').withArgs(pid).rejects(error);

      await expect(killOrphans()).to.eventually.be.rejectedWith(error);

      expect(fkill).to.have.been.calledOnce;
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
