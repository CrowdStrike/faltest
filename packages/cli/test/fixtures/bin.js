'use strict';

process.env.FALTEST_CONFIG_DIR = __dirname;

let bin = 'faltest';

if (process.platform === 'win32') {
  bin += '.cmd';
}

require(`../../../../node_modules/.bin/${bin}`);
