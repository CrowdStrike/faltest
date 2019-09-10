'use strict';

function wrap(mocha, func) {
  let _mocha = func(mocha);
  for (let name of Object.keys(mocha)) {
    if (typeof mocha[name] === 'function') {
      _mocha[name] = func(mocha[name]);
    }
  }
  return _mocha;
}

module.exports = {
  wrap,
};
