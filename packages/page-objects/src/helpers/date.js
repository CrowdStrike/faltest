'use strict';

const thirtyMins = 30 * 60 * 1000;

function encodeString(original, outOfRange, interval = thirtyMins) {
  let now = new Date().getTime();
  let timeout;

  if (outOfRange) {
    // You can create out of date rows if you want
    // for testing purposes.
    timeout = now - interval;
  } else {
    timeout = now;
  }

  let encoded = `${original}_${timeout}`;
  return encoded;
}

function getEncodedData(encoded) {
  let matches = encoded.match(/^(.+)_(\d+)$/);
  let name;
  let time;
  if (matches) {
    name = matches[1];
    time = matches[2];
  }
  return {
    name,
    time,
  };
}

function isInRange(then, interval = thirtyMins) {
  let timeout = new Date(parseInt(then) + interval);
  let now = new Date();
  return now < timeout;
}

function shouldPurge(maybeEncoded, baseStrings, interval) {
  let {
    name,
    time,
  } = getEncodedData(maybeEncoded);

  if (!name) {
    return false;
  }

  if (baseStrings.every(original => original !== name)) {
    return false;
  }

  return !isInRange(time, interval);
}

module.exports = {
  encodeString,
  shouldPurge,
};
