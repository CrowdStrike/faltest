'use strict';

const debug = require('./debug');
const cp = require('child_process');
const { promisify } = require('util');
const _exec = promisify(cp.exec);
const path = require('path');
const pkgConf = require('pkg-conf');

async function exec(command, ...args) {
  debug(command);
  let result = (await _exec(command, ...args)).stdout.trim();
  debug(result);
  return result;
}

// The `bin` option is currently unused.
// https://github.com/CrowdStrike/faltest/pull/41
// Once all browser support is added, consider removing.
async function findBin(name, bin) {
  if (!bin) {
    bin = name;
  }

  let resolved = require.resolve(name);

  debug.verbose('resolved', resolved);

  let cwd = path.dirname(resolved);

  let binObj = await pkgConf('bin', { cwd });

  let pkgPath = pkgConf.filepath(binObj);

  let binPath = binObj[bin];

  if (!binPath) {
    throw new Error(`Bin file "${bin}" not found in "${pkgPath}".`);
  }

  let fullPath = path.resolve(path.dirname(pkgPath), binPath);

  debug.verbose('fullPath', fullPath);

  return fullPath;
}

module.exports.exec = exec;
module.exports.findBin = findBin;
