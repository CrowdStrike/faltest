'use strict';

const originalStrings = new Map();

function encodeString(original, outOfRange, interval = thirtyMins) {
  let now = new Date().getTime();
  let timeout;

  if (outOfRange) {
    // You can create out of date rows if you want
    // for testing purposes.
    timeout = new Date(now - interval).getTime();
  } else {
    timeout = now;
  }

  let encoded = `${original}_${timeout}`;
  originalStrings.set(encoded, original);
  return encoded;
}

function getOriginalString(encoded) {
  if (!originalStrings.has(encoded)) {
    throw new Error(`"${encoded}" is not a key in the map.`);
  }

  return originalStrings.get(encoded);
}

const thirtyMins = 30 * 60 * 1000;

function isInRange(encoded, interval = thirtyMins) {
  let [then] = encoded.match(/\d*$/);
  let timeout = new Date(parseInt(then) + interval);
  let now = new Date();
  return now < timeout;
}

function shouldPurge(maybeEncoded, encodedStrings, interval) {
  if (encodedStrings.map(getOriginalString).every(original => !maybeEncoded.includes(original))) {
    return false;
  }

  let encoded = maybeEncoded;

  return !isInRange(encoded, interval);
}

module.exports.encodeString = encodeString;
module.exports.getOriginalString = getOriginalString;
module.exports.isInRange = isInRange;
module.exports.shouldPurge = shouldPurge;
