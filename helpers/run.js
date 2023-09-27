'use strict';

const execa = require('execa');

async function run(command, options) {
  let cp = execa.command(command, {
    preferLocal: true,
    ...options,
  });

  cp.stdout.pipe(process.stdout);
  cp.stderr.pipe(process.stderr);

  try {
    let { stdout } = await cp;

    return stdout;
  } catch (err) {
    return err.stdout;
  }
}

module.exports = run;
