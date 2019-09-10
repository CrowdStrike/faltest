'use strict';

function doesNodeMatch(node, names) {
  if (node.type !== 'Identifier') {
    return false;
  }

  return names.includes(node.name);
}

module.exports = {
  create(context) {
    return {
      CallExpression(node) {
        let { callee } = node;

        if (callee.type !== 'MemberExpression') {
          return;
        }

        let rightSide = callee.property;

        if (!doesNodeMatch(rightSide, ['throttleOn', 'throttleOff'])) {
          return;
        }

        let leftSide = callee.object;

        if (leftSide.type === 'MemberExpression') {
          leftSide = leftSide.property;
        }

        if (!doesNodeMatch(leftSide, ['browser', '_browser'])) {
          return;
        }

        context.report({
          node,
          message: 'Browser throttling should not be checked in.',
        });
      },
    };
  },
};
