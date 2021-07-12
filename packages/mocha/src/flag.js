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

function infoFor(stringOrObjectOrCallback) {
  let name;
  let flags = [];
  if (typeof stringOrObjectOrCallback === 'string') {
    name = stringOrObjectOrCallback;
  } else {
    name = stringOrObjectOrCallback.name;
    if (stringOrObjectOrCallback.flags) {
      flags = stringOrObjectOrCallback.flags;
    }
  }

  return { name, flags };
}

function formatName(name, flags, handler) {
  if (flags.length) {
    name = formatTitle(name);
    name += `${handler.titleSeparator || titleSeparator}flags: ${flags.join(', ')}`;
  }

  return name;
}


function isSkipped({ flags, total, isDeactivated }) {
  return !isDeactivated && flags.length && !areAllFlagsPresent(flags, total);
}

function flaggedIt(total, isDeactivated) {
  return mocha => {
    return function flaggedIt(stringOrObject, callback) {
      let { name, flags } = infoFor(stringOrObject);

      if (!isDeactivated) {
        name = formatTitle(name);
      }

      name = formatName(name, flags, mocha.it);

      mocha.it(name, async function () {
        if (isSkipped({ flags, total, isDeactivated })) {
          this.skip();
          return;
        }

        await callback.apply(this, arguments);
      });
    };
  };
}

function flaggedDescribe(total, isDeactivated) {
  return mocha => {
    return function flaggedDescribe(stringOrObjectOrCallback, callback) {
      let { name, flags } = infoFor(stringOrObjectOrCallback);

      if (!isDeactivated) {
        name = formatName(name, flags, mocha.describe);
      }

      if (!callback) {
        callback = stringOrObjectOrCallback;
      }

      let describeArgs = [];

      if (name) {
        describeArgs.push(name);
      }

      function anonymousDescribe() {
        function before(beforeCallback) {
          return mocha.before(function (...args) {
            if (isSkipped({ flags, total, isDeactivated })) {
              this.skip();
              return;
            }

            return beforeCallback.apply(this, args);
          });
        }

        function after(afterCallback) {
          return mocha.after(function (...args) {
            if (isSkipped({ flags, total, isDeactivated })) {
              this.skip();
              return;
            }

            return afterCallback.apply(this, args);
          });
        }

        function beforeEach(beforeEachCallback) {
          return mocha.beforeEach(function (...args) {
            if (isSkipped({ flags, total, isDeactivated })) {
              this.skip();
              return;
            }

            return beforeEachCallback.apply(this, args);
          });
        }

        function afterEach(afterEachCallback) {
          return mocha.afterEach(function (...args) {
            if (isSkipped({ flags, total, isDeactivated })) {
              this.skip();
              return;
            }

            return afterEachCallback.apply(this, args);
          });
        }

        callback.apply(this, [{ beforeEach, afterEach, before, after }]);

      }

      describeArgs.push(anonymousDescribe);

      mocha.describe(...describeArgs);
    };
  };
}

function createIt(mocha, flags, isDeactivated) {
  let _flaggedTest = flaggedIt(flags, isDeactivated);

  let _it = wrap(mocha, 'it', _flaggedTest);

  return _it;
}

function createDescribe(mocha, flags, isDeactivated) {
  let _flaggedDescribe = flaggedDescribe(flags, isDeactivated);

  let _describe = wrap(mocha, 'describe', _flaggedDescribe);

  return _describe;
}

module.exports = {
  createIt,
  createDescribe,
};
