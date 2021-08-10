'use strict';


function log(name) {
  const debug = require('./debug')(name);

  return async function log(blockName, callback) {
    if (!callback) {
      const { default: callsites } = await import('callsites');

      let callerName = callsites()[1].getFunctionName();

      callback = blockName;
      blockName = callerName;
    }

    debug.verbose(`begin ${blockName}`);

    let before = new Date();

    try {
      return await callback();
    } finally {
      let elapsed = new Date() - before;

      debug.verbose(`end ${blockName} in ${elapsed}ms}`);
    }
  };
}

module.exports = log;
