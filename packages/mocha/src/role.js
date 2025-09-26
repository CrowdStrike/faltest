'use strict';

const {
  isAlreadyInMocha,
} = require('mocha-helpers');
const { wrap } = require('./mocha');

function roles(getRole, getFilePathTitle) {
  return mocha => {
    return function roles(...args) {
      let callback = args.pop();

      let roles = [];
      if (args.length > 1) { // roles as multiple arguments
        roles = args;
      } else if (typeof args[0] === 'string' || args[0] instanceof String) { // roles as concatenated string
        // must be instanced and not inline
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Finding_successive_matches
        let regex = /(?:^| )#([^ ]+)/g;
        // eslint-disable-next-line no-cond-assign
        for (let matches; matches = regex.exec(args[0]);) {
          roles.push(matches[1]);
        }
      }

      function loopRoles() {
        // eslint-disable-next-line no-cond-assign
        for (let role of roles) {
          mocha.describe(`#${role}`, function() {
            global.before(function() {
              this.role = getRole(role);
            });

            return callback.apply(this, arguments);
          });
        }
      }

      if (isAlreadyInMocha()) {
        loopRoles();
      } else if (getFilePathTitle) {
        global.describe(getFilePathTitle(), loopRoles);
      }
    };
  };
}

function create(mocha, getRole, getFilePathTitle) {
  let __roles = roles(getRole, getFilePathTitle);

  let _roles = wrap(mocha, 'describe', __roles);

  return _roles;
}

module.exports = {
  create,
};
