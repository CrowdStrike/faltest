'use strict';

const execa = require('execa');

async function run(command, options) {
  try {
    let cp = execa.command(command, options);

    cp.stdout.pipe(process.stdout);
    cp.stderr.pipe(process.stderr);

    let { stdout } = await cp;

    return stdout;
  } catch (err) {
    return err.stdout;
  }
}

module.exports = run;
