'use strict';

const callsites = require('callsites');

function log(name) {
  const debug = require('./debug')(name);

  return async function log(blockName, callback) {
    if (!callback) {
      let callerName = callsites()[1].getFunctionName();

      callback = blockName;
      blockName = callerName;
    }

    debug.verbose(`begin ${blockName}`);

    try {
      return await callback();
    } finally {
      debug.verbose(`end ${blockName}`);
    }
  };
}

module.exports = log;
