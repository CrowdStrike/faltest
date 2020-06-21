#!/usr/bin/env node
'use strict';

require('../src/utils/throw-up');

const debug = require('../src/debug');
const initCli = require('../src');
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
  let statsArray = [];

  async function runTests(runTests) {
    let stats = await runTests({
      globs,
      ...argv,
    });

    statsArray.push(stats);
  }

  try {
    if (argv.duplicate > 0) {
      const { spawn, Pool, Worker } = require('threads');

      let pool = Pool(() => spawn(new Worker('../src/worker')), argv.duplicate + 1);

      for (let i = 0; i <= argv.duplicate; i++) {
        pool.queue(runTests);
      }

      let errors = await pool.settled();

      if (errors.length) {
        throw errors[0];
      }

      await pool.terminate();
    } else {
      await runTests(require('@faltest/mocha').runTests);
    }
  } finally {
    if (!argv.disableCleanup) {
      await require('@faltest/remote').killOrphans();
    }
  }

  // `suites` is a better property to check than `tests` because
  // you could have an error in a `before`/`beforeEach` that causes
  // `tests` to be zero and `suites` to be non-zero.
  let wereTestsFound = !!statsArray[0].suites;

  if (!wereTestsFound) {
    // We should file an issue for Mocha not throwing
    // when a `grep` removes all the tests
    throw new Error('no tests found');
  } else if (statsArray.find(stats => stats.failures)) {
    process.exitCode = 1;
  }

  if (argv.disableCleanup) {
    // simulate Mocha's --exit
    // eslint-disable-next-line no-process-exit
    process.exit(process.exitCode || 0);
  }
})();
