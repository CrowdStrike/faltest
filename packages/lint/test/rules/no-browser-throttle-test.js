'use strict';

const { RuleTester } = require('eslint');
const rule = require('../../src/rules/no-browser-throttle');

describe('', function() {
  new RuleTester().run('no-browser-throttle', rule, {
    valid: [
      `foo.throttleOn()`,
      `foo.throttleOff()`,
      `browser.throttleOn`,
      `browser.throttleOff`,
      `_browser.throttleOn`,
      `_browser.throttleOff`,
      `this.browser.throttleOn`,
      `this.browser.throttleOff`,
      `this._browser.throttleOn`,
      `this._browser.throttleOff`,
    ],
    invalid: [
      {
        code: `browser.throttleOn()`,
        errors: [{
          message: 'Browser throttling should not be checked in.',
          type: 'CallExpression',
        }],
      },
      {
        code: `browser.throttleOff()`,
        errors: [{
          message: 'Browser throttling should not be checked in.',
          type: 'CallExpression',
        }],
      },
      {
        code: `_browser.throttleOn()`,
        errors: [{
          message: 'Browser throttling should not be checked in.',
          type: 'CallExpression',
        }],
      },
      {
        code: `_browser.throttleOff()`,
        errors: [{
          message: 'Browser throttling should not be checked in.',
          type: 'CallExpression',
        }],
      },
      {
        code: `this.browser.throttleOn()`,
        errors: [{
          message: 'Browser throttling should not be checked in.',
          type: 'CallExpression',
        }],
      },
      {
        code: `this.browser.throttleOff()`,
        errors: [{
          message: 'Browser throttling should not be checked in.',
          type: 'CallExpression',
        }],
      },
      {
        code: `this._browser.throttleOn()`,
        errors: [{
          message: 'Browser throttling should not be checked in.',
          type: 'CallExpression',
        }],
      },
      {
        code: `this._browser.throttleOff()`,
        errors: [{
          message: 'Browser throttling should not be checked in.',
          type: 'CallExpression',
        }],
      },
    ],
  });
});
