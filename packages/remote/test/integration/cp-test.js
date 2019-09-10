'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { findBin } = require('../../src/cp');

describe(function() {
  describe(findBin, function() {
    it('throws when name not found', async function() {
      await expect(findBin('k9a78sdf98s')).to.eventually.be.rejectedWith('Cannot find module \'k9a78sdf98s\'');
    });

    it('throws when bin not found', async function() {
      await expect(findBin('chromedriver', 'k9a78sdf98s')).to.eventually.be.rejectedWith('Bin file "k9a78sdf98s" not found');
    });

    it('works', async function() {
      let bin = await findBin('chromedriver');

      expect(bin).to.be.a.file();
    });
  });
});
