'use strict';

async function emit(events, name, ...args) {
  let promises = [];

  events.emit(name, promises, ...args);

  await Promise.all(promises);
}

function on(events, name, callback) {
  events.on(name, (promises, ...args) => {
    promises.push(callback(...args));
  });
}

module.exports = {
  emit,
  on,
};
