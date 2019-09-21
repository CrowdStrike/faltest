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

  for (let { location } of Object.values(json)) {
    if (!location.startsWith(packagePrefix)) {
      continue;
    }

    let cwd = path.resolve(__dirname, '..', location);

    console.log(location);

    await execa('yarn', [scriptName], {
      cwd,
      stdio: 'inherit',
    });
  }
})();

require('../packages/cli/src/utils/throw-up');
