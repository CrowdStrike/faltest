'use strict';

const {
  properties: _properties,
  Browser,
} = require('@faltest/chai');

const properties = Object.entries(_properties);

const propertyValues = properties.map(p => p[1].pageObjectMethod);
const browserValues = properties.filter(p => p[1].PageObject === Browser).map(p => p.pageObjectMethod);

const browserNames = [
  'browser',
  '_browser',
];

module.exports = {
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.name !== 'expect') {
          return;
        }

        let firstArg = node.arguments[0];

        if (!firstArg || firstArg.type !== 'CallExpression') {
          return;
        }

        let { callee } = firstArg;

        if (callee.type !== 'MemberExpression') {
          return;
        }

        let methodName = callee.property.name;

        if (!propertyValues.includes(methodName)) {
          return;
        }

        if (browserValues.includes(methodName)) {
          let { object } = callee;

          let name;
          if (object.type === 'Identifier') {
            name = object.name;
          }
          if (object.type === 'MemberExpression' && object.property.type === 'Identifier') {
            name = object.property.name;
          }

          if (!browserNames.includes(name)) {
            return;
          }
        }

        let propertyName = properties.find(p => p[1].pageObjectMethod === methodName)[0];

        context.report({
          node,
          message: `You must use the Chai WebDriver property \`expect(pageObject).${propertyName}\`.`,
        });
      },
    };
  },
};
