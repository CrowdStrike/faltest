'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { event: { emit, on } } = require('../../src');
const sinon = require('sinon');
const EventEmitter = require('events');
const pDefer = require('p-defer');

describe(function() {
  it('works', async function() {
    let name = 'foo';
    let args = ['bar', 'baz'];

    let deferredPromises = [];

    for (let i = 0; i < 2; i++) {
      deferredPromises.push(pDefer());
    }

    let deferredPromisesToConsume = [...deferredPromises];

    let callback = sinon.stub().withArgs(...args).callsFake(() => {
      return deferredPromisesToConsume.shift().promise;
    });

    let events = new EventEmitter();

    for (let i = 0; i < deferredPromises.length; i++) {
      on(events, name, callback);
    }

    let emitPromise = emit(events, name, ...args);

    expect(callback).to.have.callCount(deferredPromises.length);

    for (let deferredPromise of deferredPromises) {
      deferredPromise.resolve();
    }

    await expect(emitPromise).to.eventually.be.fulfilled;
  });
});
