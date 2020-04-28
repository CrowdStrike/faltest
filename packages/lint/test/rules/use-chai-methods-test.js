'use strict';

const { RuleTester } = require('eslint');
const rule = require('../../src/rules/use-chai-methods');
const {
  properties: _properties,
  Browser,
} = require('@faltest/chai');

const properties = Object.entries(_properties);

const browserProperties = properties.filter(p => p[1].PageObject === Browser);
const pageObjectProperties = properties.filter(p => p[1].PageObject !== Browser);

describe('', function() {
  new RuleTester().run('use-chai-methods', rule, {
    valid: [
      'foo()',
      'expect()',
      'expect(foo)',
      'expect(foo())',
      'expect(foo.bar())',
      `expect(foo).${pageObjectProperties[0][0]}`,
      `expect(foo.${browserProperties[0][1].pageObjectMethod})`,
      `expect(foo.bar.${browserProperties[0][1].pageObjectMethod})`,
      `expect(foo().${browserProperties[0][1].pageObjectMethod})`,
    ],
    invalid: [
      {
        code: `expect(foo.${pageObjectProperties[0][1].pageObjectMethod}())`,
        errors: [{
          message: `You must use the Chai WebDriver property \`expect(pageObject).${pageObjectProperties[0][0]}\`.`,
          type: 'CallExpression',
        }],
      },
      {
        code: `expect(browser.${browserProperties[0][1].pageObjectMethod}())`,
        errors: [{
          message: `You must use the Chai WebDriver property \`expect(pageObject).${browserProperties[0][0]}\`.`,
          type: 'CallExpression',
        }],
      },
      {
        code: `expect(_browser.${browserProperties[0][1].pageObjectMethod}())`,
        errors: [{
          message: `You must use the Chai WebDriver property \`expect(pageObject).${browserProperties[0][0]}\`.`,
          type: 'CallExpression',
        }],
      },
      {
        code: `expect(this.browser.${browserProperties[0][1].pageObjectMethod}())`,
        errors: [{
          message: `You must use the Chai WebDriver property \`expect(pageObject).${browserProperties[0][0]}\`.`,
          type: 'CallExpression',
        }],
      },
      {
        code: `expect(this._browser.${browserProperties[0][1].pageObjectMethod}())`,
        errors: [{
          message: `You must use the Chai WebDriver property \`expect(pageObject).${browserProperties[0][0]}\`.`,
          type: 'CallExpression',
        }],
      },
    ],
  });
});
