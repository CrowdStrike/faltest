'use strict';

const _debug = require('debug');

function debug(name) {
  let instance = _debug(name);

  instance.verbose = instance.extend('verbose');

  return instance;
}

module.exports = debug;
