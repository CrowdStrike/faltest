#!/usr/bin/env node
'use strict';

const execa = require('execa');
const path = require('path');

(async () => {
  await execa.command('yarn install --force', {
    cwd: path.resolve(__dirname, '../fixtures/global-install'),
  });
})();

require('../packages/cli/src/utils/throw-up');
