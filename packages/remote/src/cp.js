'use strict';

const debug = require('./debug');
const execa = require('execa');
const path = require('path');

function defaults(file, options) {
  return {
    preferLocal: true,
    localDir: path.dirname(require.resolve(file)),
    ...options,
  };
}

function spawn(file, args, options) {
  debug(file, args);

  return execa(file, args, defaults(file, options));
}

async function spawnAwait(file, args, options) {
  let result = (await spawn(file, args, options)).stdout;

  debug(result);

  return result;
}

module.exports = {
  spawn,
  spawnAwait,
};
