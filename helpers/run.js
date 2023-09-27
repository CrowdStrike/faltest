'use strict';

async function run(command, options) {
  const { execaCommand } = await import('execa');

  let cp = execaCommand(command, {
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
