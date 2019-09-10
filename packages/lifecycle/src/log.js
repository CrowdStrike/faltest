'use strict';

const callsites = require('callsites');
const debug = require('./debug');

module.exports = async function log(blockName, callback) {
  if (!callback) {
    let callerName = callsites()[1].getFunctionName();

    callback = blockName;
    blockName = callerName;
  }

  debug.verbose(`begin ${blockName}`);

  let result = await callback();

  debug.verbose(`end ${blockName}`);

  return result;
};
