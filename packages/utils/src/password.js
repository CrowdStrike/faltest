'use strict';

const {
  hideNextPassword,
  resetCounter,
  replacementText,
} = require('./require-before-webdriverio');

async function hidePassword(callback) {
  hideNextPassword();
  try {
    await callback();
  } finally {
    resetCounter();
  }
}

module.exports = {
  hidePassword,
  replacementText,
};
