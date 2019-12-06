'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { waitForDownload } = require('../../src');
const sinon = require('sinon');
const { promisify } = require('util');
const getTmpDir = promisify(require('tmp').dir);
const path = require('path');
const fs = require('fs');
const writeFile = promisify(fs.writeFile);

function mockAccess() {
  let originalAccess = fs.access;
  return new Promise(resolve => {
    // eslint-disable-next-line max-params
    sinon.stub(fs, 'access').callsFake((path, mode, callback, ...args) => {
      let originalCallback = callback;
      callback = function(err) {
        resolve(err);
        return originalCallback(...arguments);
      };
      return originalAccess(path, mode, callback, ...args);
    });
  });
}

describe(waitForDownload, function() {
  beforeEach(async function() {
    this.filePath = path.join(await getTmpDir(), 'foo.txt');
  });

  afterEach(function() {
    sinon.restore();
  });

  it('can time out', async function() {
    await expect(waitForDownload(this.filePath, 0))
      .to.eventually.be.rejectedWith('foo.txt failed to download in 0ms');
  });

  it('finds already existing file', async function() {
    await writeFile(this.filePath, '');

    let accessPromise = mockAccess();

    await expect(waitForDownload(this.filePath))
      .to.eventually.be.fulfilled;

    let err = await accessPromise;

    expect(err).to.not.be.ok;
  });

  it('watches for file creation', async function() {
    let accessPromise = mockAccess();

    let waitForDownloadPromise = waitForDownload(this.filePath);

    let err = await accessPromise;

    expect(err).to.be.ok;

    writeFile(this.filePath, '');

    await expect(waitForDownloadPromise)
      .to.eventually.be.fulfilled;
  });
});
