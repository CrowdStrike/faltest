'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { event: { emit, on } } = require('../../src');
const sinon = require('sinon');
const EventEmitter = require('events');

describe(function() {
  describe(emit, function() {
    it('works', async function() {
      let name = 'foo';
      let args = ['bar', 'baz'];

      let deferredPromises = [];

      const { default: pDefer } = await import('p-defer');

      for (let i = 0; i < 2; i++) {
        deferredPromises.push(pDefer());
      }

      let deferredPromisesToConsume = [...deferredPromises];
      let promisesList = [];

      let callback = sinon.stub().withArgs(sinon.match.array, ...args).callsFake(promises => {
        promises.push(deferredPromisesToConsume.shift().promise);
        promisesList.push(promises);
      });

      let events = new EventEmitter();

      for (let i = 0; i < deferredPromises.length; i++) {
        events.on(name, callback);
      }

      let emitPromise = emit(events, name, ...args);

      expect(callback).to.have.callCount(deferredPromises.length);

      for (let promises of promisesList.slice(1)) {
        expect(promises, 'it uses the same array every time').to.equal(promisesList[0]);
      }

      expect(promisesList[0]).to.have.a.lengthOf(deferredPromises.length);

      for (let deferredPromise of deferredPromises) {
        deferredPromise.resolve();
      }

      await expect(emitPromise).to.eventually.be.fulfilled;
    });
  });

  describe(on, function() {
    it('works', async function() {
      let name = 'foo';
      let args = ['bar', 'baz'];

      let deferredPromises = [];

      const { default: pDefer } = await import('p-defer');

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

      let promises = [];

      events.emit(name, promises, ...args);

      expect(promises).to.have.a.lengthOf(deferredPromises.length);

      for (let deferredPromise of deferredPromises) {
        deferredPromise.resolve();
      }

      await expect(Promise.all(promises)).to.eventually.be.fulfilled;
    });
  });
});
