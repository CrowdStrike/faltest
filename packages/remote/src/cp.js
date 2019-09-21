'use strict';

const debug = require('./debug');
const execa = require('execa');

function defaults(options) {
  return {
    preferLocal: true,
    ...options,
  };
}

async function exec(command, options) {
  debug(command);

  let result = (await execa.command(command, defaults(options))).stdout;

  debug(result);

  return result;
}

function spawn(file, args, options) {
  debug(file, args);

  return execa(file, args, defaults(options));
}

module.exports = {
  exec,
  spawn,
};
