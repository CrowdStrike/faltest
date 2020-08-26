'use strict';

function wrap(mocha, name, func) {
  let test = func({ [name]() { return mocha[name](...arguments); } });
  for (let modifier of Object.keys(mocha[name])) {
    if (typeof mocha[name][modifier] === 'function') {
      test[modifier] = func({ [name]() { return mocha[name][modifier](...arguments); } });
    }
  }
  return test;
}

module.exports = {
  wrap,
};
