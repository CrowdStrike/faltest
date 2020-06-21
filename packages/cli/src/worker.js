'use strict';

const { runTests } = require('@faltest/mocha');
const { expose } = require('threads/worker');

expose(runTests);
