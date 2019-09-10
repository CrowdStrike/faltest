'use strict';

const {
  formatTitle,
  titleSeparator,
} = require('mocha-helpers');
const { wrap } = require('./mocha');

function areAllFlagsPresent(names, total) {
  return names.every(name => {
    let isInverse = name[0] === '!';
    let realName = name.substr(isInverse ? 1 : 0);

    let wasFound = total.includes(realName);

    return isInverse ? !wasFound : wasFound;
  });
}

function flaggedTest(total, isDeactivated) {
  return it => {
    return function flaggedTest(stringOrObject, callback) {
      let name;
      let flags = [];
      if (typeof stringOrObject === 'string') {
        name = stringOrObject;
      } else {
        name = stringOrObject.name;
        if (stringOrObject.flags) {
          flags = stringOrObject.flags;
        }
      }

      if (!isDeactivated && flags.length) {
        name = formatTitle(name);
        name += `${it.titleSeparator || titleSeparator}flags: ${flags.join(', ')}`;
      }

      it(name, async function () {
        if (!isDeactivated && flags.length && !areAllFlagsPresent(flags, total)) {
          this.skip();
          return;
        }

        await callback.apply(this, arguments);
      });
    };
  };
}

function create(it, flags, isDeactivated) {
  let _flaggedTest = flaggedTest(flags, isDeactivated);

  let _it = wrap(it, _flaggedTest);

  return _it;
}

module.exports = {
  create,
};
