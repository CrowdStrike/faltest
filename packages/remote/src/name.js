'use strict';

const { name } = require('../package');

let nameWithoutScope;

// https://github.com/npm/npm-package-arg/pull/38
// const npa = require('npm-package-arg');
// nameWithoutScope = npa(name).nameWithoutScope;

nameWithoutScope = name.slice(name.indexOf('/') + 1);

module.exports.nameWithoutScope = nameWithoutScope;
