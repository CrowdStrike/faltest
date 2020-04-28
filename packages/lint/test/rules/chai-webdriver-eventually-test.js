'use strict';

const { RuleTester } = require('eslint');
const rule = require('../../src/rules/chai-webdriver-eventually');
const { properties } = require('@faltest/chai');

const propertyKeys = Object.keys(properties);

describe('', function() {
  new RuleTester().run('chai-webdriver-eventually', rule, {
    valid: [
      `expect().to.be`,
      `expect()().be`, // non-MemberExpression
      `foo().to.be`,
      `foo().to.eventually.be`,
      `foo().${propertyKeys[0]}.to.be`,
      `expect().${propertyKeys[0]}.to.eventually.be`,
    ],
    invalid: [
      {
        code: `expect().${propertyKeys[0]}.to.be`,
        errors: [{
          message: `You must add \`eventually\` when using Chai WebDriver property \`${propertyKeys[0]}\`.`,
          type: 'ExpressionStatement',
        }],
      },
    ],
  });
});
