'use strict';

const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function replaceFile(path, callback) {
  let contents = await readFile(path, 'utf8');
  contents = await callback(contents);
  await writeFile(path, contents);
}

module.exports = {
  replaceFile,
};
