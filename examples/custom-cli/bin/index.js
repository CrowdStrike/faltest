#!/usr/bin/env node
'use strict';

const path = require('path');

process.env.FALTEST_CONFIG_DIR = path.resolve(__dirname, '..');

require(path.resolve(path.dirname(require.resolve('@faltest/cli')), '../bin'));
