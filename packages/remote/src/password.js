'use strict';

const { hideNextPassword } = require('./utils/require-before-webdriverio');

async function setPassword(element, password) {
  hideNextPassword();
  return await element.setValue(password);
}

module.exports = {
  setPassword,
};
