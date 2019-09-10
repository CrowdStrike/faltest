'use strict';

const { RuleTester } = require('eslint');
const rule = require('../../src/rules/mocha-roles-only');

describe('', function() {
  new RuleTester().run('mocha-roles-only', rule, {
    valid: [
      `foo.only('', function() {})`,
      `roles.foo('', function() {})`,
      `roles.only`,
      `roles('', function() {})`,
    ],
    invalid: [
      {
        code: `roles.only('', function() {})`,
        errors: [{
          message: 'Unexpected `roles.only`.',
          type: 'Identifier',
        }],
      },
    ],
  });
});
