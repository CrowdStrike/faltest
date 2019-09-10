'use strict';

const debug = require('debug');
const { nameWithoutScope } = require('./name');

module.exports = debug(nameWithoutScope);
module.exports.verbose = module.exports.extend('verbose');
