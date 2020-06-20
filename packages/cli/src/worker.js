'use strict';

const { runTests } = require('@faltest/mocha');

if (require.main === module) {
  const { expose } = require('threads/worker');

  expose(runTests);
} else {
  module.exports = runTests;
}
