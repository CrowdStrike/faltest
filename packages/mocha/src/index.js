'use strict';

const Mocha = require('mocha');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const { buildGrep } = require('./tag');
const failureArtifacts = require('./failure-artifacts');
const debug = require('./debug');
const path = require('path');

const { Runner } = Mocha;
const { constants } = Runner;

async function runMocha(mocha, options) {
  let runner;

  let promises = [];
  let errors = [];

  await new Promise(resolve => {
    // `mocha.run` is synchronous if no tests were found,
    // otherwise, it's asynchronous...
    runner = mocha.run(resolve);

    runner.on(constants.EVENT_TEST_BEGIN, () => {
      global.promisesToFlushBetweenTests = [];
    });

    function handlePromises(callback) {
      let perTestPromises = [];

      if (options.failureArtifacts) {
        let promise = callback();

        perTestPromises.push(promise);

        // Mocha inspects the Promise rejection queue on exit or something.
        // We can't leave any rejecting promises for later.
        promise = promise.catch(err => errors.push(err));

        promises.push(promise);
      }

      // Prevent "stale element reference: element is not attached to the page document"
      // or "Error: connect ECONNREFUSED 127.0.0.1:61188"
      global.promisesToFlushBetweenTests = perTestPromises;
    }

    runner.on(constants.EVENT_TEST_FAIL, test => {
      handlePromises(() => {
        return failureArtifacts.call(test.ctx, options.failureArtifactsOutputDir);
      });
    });

    runner.on(constants.EVENT_TEST_RETRY, (test, err) => {
      debug(`Retrying failed test "${test.title}": ${err}`);
    });

    runner.on(constants.EVENT_TEST_PASS, (test) => {
      handlePromises(() => {
        return failureArtifacts.flush.call(test.ctx);
      });
    });
  });

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
  }

  return runner.stats;
}

module.exports = {
  runTests,
  createRolesHelper: require('./role').create,
  createFlaggedTest: require('./flag').create,
};
