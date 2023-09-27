#!/usr/bin/env node
'use strict';

const path = require('path');

(async () => {
  const { execa } = await import('execa');

  await execa('yarn', ['install', '--force'], {
    cwd: path.resolve(__dirname, '../fixtures/global-install'),
    stdio: 'inherit',
  });
})();

require('../packages/cli/src/utils/throw-up');
