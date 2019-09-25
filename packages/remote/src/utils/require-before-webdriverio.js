/**
 * `webdriverio` provides no way to intercept the logger,
 * so we install a plugin on its logger to filter it.
 */
'use strict';

const debug = require('../debug');

// We want the version that comes with `webdriverio`.
// eslint-disable-next-line node/no-extraneous-require
const log = require('loglevel');

let shouldHideNextPassword;

// https://github.com/pimterry/loglevel#writing-plugins
const { methodFactory } = log;
log.methodFactory = function(methodName, level, loggerName) {
  let _rawMethod = methodFactory(...arguments);

  let rawMethod;
  if (methodName === 'info' && loggerName === 'webdriver') {
    module.exports.rawMethod = _rawMethod;
    rawMethod = function() {
      module.exports.rawMethod(...arguments);
    };
  } else {
    rawMethod = _rawMethod;
  }

  return function(message, type, data) {
    // `webdriverio` logging is broken and sometimes ignores `logLevel`
    // so we do our own filtering
    if (!debug.enabled) {
      return;
    }

    if (shouldHideNextPassword && type && type.includes('DATA') && data.text) {
      rawMethod(message, type, Object.assign({}, data, {
        text: '[REDACTED]',
      }));
      shouldHideNextPassword = false;
      return;
    }

    rawMethod(...arguments);
  };
};
log.setLevel(log.getLevel()); // Be sure to call setLevel method in order to apply plugin

module.exports.hideNextPassword = () => shouldHideNextPassword = true;
