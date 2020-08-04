#!/usr/bin/env node
'use strict';

const execa = require('execa');
const path = require('path');
const { replaceFile } = require('../helpers/fs');

const rootDirectory = path.resolve(__dirname, '..');

async function replace({ replacementRegex, replacementText, filePath }) {
  replacementText = `$1

\`\`\`
${replacementText}
\`\`\`

$2`;

  await replaceFile(filePath, (contents) => {
    if (!replacementRegex.test(contents)) {
      throw new Error(`${filePath} is malformed`);
    }

    return contents.replace(replacementRegex, replacementText);
  });
}

async function syncCliOptions() {
  let helpText = (
    await execa('yarn', ['--silent', 'start', '--help'], {
      cwd: rootDirectory,
      env: {
        FALTEST_PRINT_VERSION: 'false',
      },
    })
  ).stdout;

  let replacementRegex = /(<!-- CODEGEN_CLI_HELP_START -->).+(<!-- CODEGEN_CLI_HELP_END -->)/s;

  let readmePath = path.join(rootDirectory, 'README.md');

  await replace({
    replacementRegex,
    replacementText: helpText,
    filePath: readmePath,
  });
}

(async () => {
  await syncCliOptions();
})();

require('../packages/cli/src/utils/throw-up');
