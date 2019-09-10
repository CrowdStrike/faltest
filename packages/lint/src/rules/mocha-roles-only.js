'use strict';

module.exports = {
  create(context) {
    return {
      CallExpression({ callee }) {
        if (callee.type !== 'MemberExpression') {
          return;
        }

        if (callee.object.name === 'roles' && callee.property.name === 'only') {
          context.report({
            node: callee.property,
            message: 'Unexpected `roles.only`.',
          });
        }
      },
    };
  },
};
