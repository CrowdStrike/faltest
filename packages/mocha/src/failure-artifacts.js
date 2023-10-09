'use strict';

const path = require('path');
const { writeFile, mkdir } = require('fs').promises;
const debug = require('./debug');

async function buildTitle(test) {
  let attempt = test.currentRetry() + 1;

  let parts = [];

  while (test) {
    if (test.title) {
      parts.unshift(test.title);
    }

    test = test.parent;
  }

  let title = parts.join(' ');

  const { default: filenamify } = await import('filenamify');

  // Tests with / in the name are bad.
  title = filenamify(title, { maxLength: 150 });

  return `${title}.${attempt}`;
}

async function failureArtifacts(error, outputDir) {
  // If an error occurs in `before` or `beforeEach`,
  // there's a chance the browser has not been initialized yet.
  if (!this.browser) {
    debug('Tried to write failure artifacts, but there is no browser set.');
    return;
  }

  let title = await buildTitle(this.test);

  await mkdir(outputDir, { recursive: true });

  async function writeArtifact(fileName, ...args) {
    let filePath = path.join(outputDir, fileName);
    debug(`Writing failure artifact to ${filePath}.`);
    await writeFile(filePath, ...args);
  }

  let screenshot = await this.browser._browser.takeScreenshot();
  await writeArtifact(`${title}.png`, screenshot, 'base64');

  let html = await this.browser._browser.getPageSource();
  await writeArtifact(`${title}.html`, html);

  let url = await this.browser.getUrl();
  await writeArtifact(`${title}.url.txt`, url);

  let logs = await getLogs(this.browser);
  for (let [logType, log] of Object.entries(logs)) {
    let logsText = JSON.stringify(log, null, 2);
    await writeArtifact(`${title}.${logType}.txt`, logsText);
  }

  // https://stackoverflow.com/a/26199752
  error = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);

  await writeArtifact(`${title}.error.txt`, error);
}

async function flush() {
  // https://v5.webdriver.io/docs/api/chromium.html#getlogs
  // "Log buffer is reset after each request."
  // For the failure logs to be useful, it should only include the failing test,
  // not the whole test run up until the failure. So we need to clear the logs
  // between each test.
  await getLogs(this.browser);
}

async function getLogs(browser) {
  let logs = {};

  if (browser._browser.getLogTypes) {
    let logTypes = await browser._browser.getLogTypes();
    for (let logType of logTypes) {
      let log = await browser._browser.getLogs(logType);

      logs[logType] = log;
    }
  }

  return logs;
}

module.exports = failureArtifacts;
module.exports.flush = flush;
