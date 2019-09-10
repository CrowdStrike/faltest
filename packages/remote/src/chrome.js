'use strict';

const debug = require('./debug');
const { exec } = require('./cp');

async function getMajorVersion() {
  let version;
  try {
    // only Linux has this command
    version = await exec('google-chrome --version');
  } catch (err) {
    debug(err.message);
    version = await exec('/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --version');
  }
  version = version.match(/ (\d+)\./)[1];
  debug(version);
  return version;
}

module.exports.getMajorVersion = getMajorVersion;
