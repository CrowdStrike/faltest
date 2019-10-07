#!/usr/bin/env node
/**
 * This replicates `yarn workspaces run ...`,
 * but allows running subsets of workspaces.
 */
'use strict';

const execa = require('execa');
const path = require('path');

let cwd;
let firstError;

function getCwd(example) {
  let cwd = path.resolve(__dirname, '../examples', example);

  console.log(cwd);

  return cwd;
}

async function run(command, cwd) {
  console.log(command);

  try {
    await execa.command(command, {
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

(async () => {
  cwd = getCwd('custom-cli');

  await run('yarn start', cwd);

  cwd = getCwd('full-suite');

  await run('yarn start', cwd);

  cwd = getCwd('lifecycle-only');

  await run('yarn start', cwd);

  cwd = getCwd('multiple-browsers');

  await run('yarn start', cwd);

  cwd = getCwd('runner-only');

  await run('yarn start', cwd);

  if (firstError) {
    throw firstError;
  }
})();

require('../packages/cli/src/utils/throw-up');
