'use strict';

const Mocha = require('mocha');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const { buildGrep } = require('./tag');
const failureArtifacts = require('./failure-artifacts');
const debug = require('./debug');
const path = require('path');
const { events } = require('mocha-helpers');

const { Runner } = Mocha;
const { constants } = Runner;

async function runMocha(mocha, options) {
  let runner;

  let promises = [];
  let errors = [];

  function handlePromises(callback) {
    let perTestPromises = [];

    let promise = callback();

    perTestPromises.push(promise);

    // Mocha inspects the Promise rejection queue on exit or something.
    // We can't leave any rejecting promises for later.
    promise = promise.catch(err => errors.push(err));

    promises.push(promise);

    // Prevent "stale element reference: element is not attached to the page document"
    // or "Error: connect ECONNREFUSED 127.0.0.1:61188"
    global.promisesToFlushBetweenTests = perTestPromises;
  }

  function begin() {
    global.promisesToFlushBetweenTests = [];
  }

  function fail() {
    handlePromises(() => {
      return failAsync(...arguments);
    });
  }
  async function failAsync(test) {
    if (options.failureArtifacts) {
      await failureArtifacts.call(test.ctx, options.failureArtifactsOutputDir);
    }
  }

  function retry() {
    handlePromises(() => {
      return retryAsync(...arguments);
    });
  }
  async function retryAsync(test, err) {
    await failAsync(test);

    debug(`Retrying failed test "${test.title}": ${err}`);
  }

  function pass() {
    handlePromises(() => {
      return passAsync(...arguments);
    });
  }
  async function passAsync(test) {
    if (options.failureArtifacts) {
      await failureArtifacts.flush.call(test.ctx);
    }
  }

  try {
    await new Promise((resolve, reject) => {
      events.on(constants.EVENT_TEST_RETRY, retryAsync);

      try {
      // `mocha.run` is synchronous if no tests were found,
      // otherwise, it's asynchronous...
        runner = mocha.run(resolve);

        runner.on(constants.EVENT_TEST_BEGIN, begin);
        runner.on(constants.EVENT_TEST_FAIL, fail);
        runner.on(constants.EVENT_TEST_RETRY, retry);
        runner.on(constants.EVENT_TEST_PASS, pass);
      } catch (err) {
        reject(err);
      }
    });
  } finally {
    events.off(constants.EVENT_TEST_RETRY, retryAsync);

    if (runner) {
      runner.off(constants.EVENT_TEST_BEGIN, begin);
      runner.off(constants.EVENT_TEST_FAIL, fail);
      runner.off(constants.EVENT_TEST_RETRY, retry);
      runner.off(constants.EVENT_TEST_PASS, pass);
    }
  }

  await Promise.all(promises);

  if (errors.length) {
    throw errors[0];
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
