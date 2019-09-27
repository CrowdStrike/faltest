#!/usr/bin/env node
/**
 * This replicates `yarn workspaces run ...`,
 * but allows running subsets of workspaces.
 */
'use strict';

const execa = require('execa');
const path = require('path');

const [packagePrefix, scriptName] = process.argv.slice(2);

(async () => {
  let cp = await execa.command('yarn --silent workspaces info');

  let json = JSON.parse(cp.stdout);

  let firstError;

  for (let { location } of Object.values(json)) {
    if (!location.startsWith(packagePrefix)) {
      continue;
    }

    let cwd = path.resolve(__dirname, '..', location);

    console.log(location);

    try {
      await execa('yarn', [scriptName], {
        cwd,
        stdio: 'inherit',
      });
    } catch (err) {
      // Continue running all the test suites,
      // but keep the first error for reporting later.
      // There may something in https://github.com/sindresorhus/promise-fun
      // to clean this up.
      if (!firstError) {
        firstError = err;
      }
    }
  }

  if (firstError) {
    throw firstError;
  }
})();

require('../packages/cli/src/utils/throw-up');
