'use strict';

const { properties } = require('@faltest/chai');

module.exports = {
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.name !== 'expect') {
          return;
        }

        let { parent } = node;

        if (parent.type !== 'MemberExpression' || !properties.includes(parent.property.name)) {
          return;
        }

        let currentNode = parent;

        while (true) {
          currentNode = currentNode.parent;
          if (currentNode.type !== 'MemberExpression') {
            break;
          }
          if (currentNode.property.name === 'eventually') {
            return;
          }
        }

        context.report({
          node: currentNode,
          message: `You must add \`eventually\` when using Chai WebDriver property \`${parent.property.name}\`.`,
        });
      },
    };
  },
};
