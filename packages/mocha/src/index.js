'use strict';

const Mocha = require('mocha');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const { buildGrep } = require('./tag');
const failureArtifacts = require('./failure-artifacts');
const debug = require('./debug');
const path = require('path');
const { events, registerAsyncEvents, unregisterAsyncEvents } = require('mocha-helpers');

const { Runner } = Mocha;
const { constants } = Runner;

async function runMocha(mocha, options) {
  let runner;

  async function fail(test, err) {
    if (options.failureArtifacts) {
      await failureArtifacts.call(test.ctx, err, options.failureArtifactsOutputDir);
    }
  }

  async function retry(test, err) {
    await fail(test, err);

    debug(`Retrying failed test "${test.title}": ${err}`);
  }

  async function pass(test) {
    if (options.failureArtifacts) {
      await failureArtifacts.flush.call(test.ctx);
    }
  }

  try {
    await new Promise((resolve, reject) => {
      try {
        events.on(constants.EVENT_TEST_FAIL, fail);
        events.on(constants.EVENT_TEST_RETRY, retry);
        events.on(constants.EVENT_TEST_PASS, pass);

        // `mocha.run` is synchronous if no tests were found,
        // otherwise, it's asynchronous...
        runner = mocha.run(resolve);

        registerAsyncEvents(runner);
      } catch (err) {
        reject(err);
      }
    });
  } finally {
    events.off(constants.EVENT_TEST_FAIL, fail);
    events.off(constants.EVENT_TEST_RETRY, retry);
    events.off(constants.EVENT_TEST_PASS, pass);

    if (runner) {
      await unregisterAsyncEvents(runner);
    }
  }

  return runner;
}

async function runTests(options) {
  let {
    globs,
    retries,
    tag: tags = [],
    filter = '',
    random,
    seed,
    timeoutsOverride,
    disableTimeouts,
    reporter,
    reporterOptions,
    dryRun,
  } = options;

  if (random) {
    if (seed) {
      process.env.CHOMA_SEED = seed;
    }

    require('choma');
  }

  if (reporterOptions) {
    reporterOptions = reporterOptions.split(',').reduce((options, option) => {
      let [key, value] = option.split('=');
      options[key] = value;
      return options;
    }, {});
  }

  let grep = buildGrep(tags, filter);

  let mochaOpts = {
    retries,
    grep,
    color: true,
    reporter,
    reporterOptions,
  };
  if (disableTimeouts) {
    mochaOpts.timeout = false;
  } else if (timeoutsOverride) {
    mochaOpts.timeout = timeoutsOverride;
  }

  let mocha = new Mocha(mochaOpts);

  for (let testsGlob of globs) {
    let files = await glob(testsGlob.split(path.sep).join(path.posix.sep));

    for (let file of files) {
      mocha.addFile(file);
    }
  }

  let runner;
  let { ...prototype } = Runner.prototype;

  if (dryRun) {
    Object.assign(Runner.prototype, {
      hook(name, fn) {
        fn();
      },
      runTest(fn) {
        try {
          this.test.skip();
        } catch (err) {
          fn(err);
        }
      },
    });
  }

  try {
    runner = await runMocha(mocha, options);
  } finally {
    Object.assign(Runner.prototype, prototype);

    try {
      mocha.dispose();
    } catch (err) {
      debug(err);
    }
  }

  return runner.stats;
}

module.exports = {
  runTests,
  createRolesHelper: require('./role').create,
  createFlaggedTest: require('./flag').create,
};
