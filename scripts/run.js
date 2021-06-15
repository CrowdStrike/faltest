#!/usr/bin/env node
/**
 * This replicates `yarn workspaces run ...`,
 * but allows running subsets of workspaces.
 */
'use strict';

const execa = require('execa');
const path = require('path');

const [packagePrefix, scriptName, ...args] = process.argv.slice(2);

const root = path.resolve(__dirname, '..');

(async () => {
  let cp = await execa('yarn', ['--silent', 'workspaces', 'info']);

  let json = JSON.parse(cp.stdout);

  let promises = Object.values(json).map(({ location }) => async () => {
    if (!location.startsWith(packagePrefix)) {
      return;
    }

    let cwd = path.join(root, location);

    console.log(location);

    await execa('yarn', [scriptName, ...args], {
      cwd,
      stdio: 'inherit',
    });
  });

  const { default: pAll } = await import('p-all');

  await pAll(promises, {
    concurrency: 1,
  });
})();

require('../packages/cli/src/utils/throw-up');
