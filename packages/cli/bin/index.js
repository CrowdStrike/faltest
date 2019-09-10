#!/usr/bin/env node
'use strict';

require('../src/utils/throw-up');

const debug = require('../src/debug');
const initCli = require('../src');
const { runTests } = require('@faltest/mocha');
const path = require('path');
const yn = require('yn');

let configDir = process.env.FALTEST_CONFIG_DIR || process.cwd();

if (!process.env.NODE_CONFIG_DIR) {
  // so you can run it as a global package
  // and still find the config files
  process.env.NODE_CONFIG_DIR = path.resolve(configDir, 'config');
}

debug.verbose('process.env');
debug.verbose(process.env);

let faltestConfig;
try {
  faltestConfig = require(path.resolve(configDir, '.faltestrc.js'));
} catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err;
  }
}

if (!faltestConfig) {
  faltestConfig = {};
}

if (yn(process.env.FALTEST_PRINT_VERSION, { default: true })) {
  initCli.printVersion(faltestConfig.name, faltestConfig.version);
}

let argv = initCli(faltestConfig.options);

if (faltestConfig.processArgs) {
  argv = faltestConfig.processArgs(argv);
}

let globs = faltestConfig.globs || argv._;

(async () => {
  let stats;

  try {
    stats = await runTests({
      globs,
      ...argv,
    });
  } finally {
    await require('@faltest/remote').killOrphans();
  }

  if (!stats.tests) {
    // We should file an issue for Mocha not throwing
    // when a `grep` removes all the tests
    throw new Error('no tests found');
  } else if (stats.failures) {
    process.exitCode = 1;
  }
})();
