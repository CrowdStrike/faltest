'use strict';

const Mocha = require('mocha');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const { buildGrep } = require('./tag');
const failureArtifacts = require('./failure-artifacts');

const { constants } = Mocha.Runner;

async function runMocha(mocha, options) {
  let runner;

  let promises = [];

  await new Promise(resolve => {
    // `mocha.run` is synchronous if no tests were found,
    // otherwise, it's asynchronous...
    runner = mocha.run(resolve);

    runner.on(constants.EVENT_TEST_FAIL, test => {
      if (options.failureArtifacts) {
        let promise = failureArtifacts.call(test.ctx, options.failureArtifactsOutputDir);

        promises.push(promise);
      }
    });
  });

  await Promise.all(promises);

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
    let files = await glob(testsGlob);

    for (let file of files) {
      mocha.addFile(file);
    }
  }

  let runner = await runMocha(mocha, options);

  return runner.stats;
}

module.exports = {
  runTests,
  createRolesHelper: require('./role').create,
  createFlaggedTest: require('./flag').create,
};
