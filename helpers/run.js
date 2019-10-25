'use strict';

const execa = require('execa');

async function run(command, options) {
  try {
    let { stdout } = await execa.command(command, options);

    return stdout;
  } catch (err) {
    return err.stdout;
  }
}

module.exports = run;
