#!/usr/bin/env node
'use strict';

const execa = require('execa');
const path = require('path');

(async () => {
  // yarn@1 is resolving incorrectly
  // Error [ERR_REQUIRE_ESM]: require() of ES Module /node_modules/string-width/index.js from /node_modules/cliui/build/index.cjs not supported.
  // await execa('yarn', ['install', '--force'], {
  await execa('npm', ['install'], {
    cwd: path.resolve(__dirname, '../fixtures/global-install'),
    stdio: 'inherit',
  });
})();

require('../packages/cli/src/utils/throw-up');
