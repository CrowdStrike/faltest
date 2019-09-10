'use strict';

module.exports = {
  options: {
    targets: {
      default: 'default',
      list: ['default', 'fixtures'],
    },
    tags: ['user', 'admin'],
    envs: {
      default: 'prod',
      list: ['dev', 'prod'],
    },
  },
  globs: ['tests/**/*-test.js'],
};
