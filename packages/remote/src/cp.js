'use strict';

const debug = require('./debug');

function defaults(file, options) {
  return {
    preferLocal: true,

    // This line was giving us `Error: Cannot find module 'msedgedriver'`,
    // and I'm not sure why it was necessary in the first place.
    // localDir: path.dirname(require.resolve(file)),

    ...options,
  };
}

// eslint-disable-next-line max-params
function spawn(execa, file, args, options) {
  debug(file, args);

  let cp = execa(file, args, defaults(file, options));

  cp.stdout.on('data', data => {
    debug(data.toString());
  });

  return cp;
}

module.exports = {
  spawn,
};
