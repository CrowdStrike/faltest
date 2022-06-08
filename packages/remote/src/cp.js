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

  let cp = execa(file, args, defaults(file, options));

  cp.stdout.on('data', data => {
    debug(data.toString());
  });

  return cp;
}

module.exports = {
  spawn,
};
