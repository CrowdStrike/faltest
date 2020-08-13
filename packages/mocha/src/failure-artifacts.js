'use strict';

const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
// const mkdir = promisify(fs.mkdir);
const mkdirp = promisify(require('mkdirp'));
const filenamify = require('filenamify');

function buildTitle(test) {
  let parts = [];

  while (test) {
    if (test.title) {
      parts.unshift(test.title);
    }

    test = test.parent;
  }

  let title = parts.join(' ');

  // Tests with / in the name are bad.
  title = filenamify(title);

  return title;
}

async function failureArtifacts(outputDir) {
  let title = buildTitle(this.currentTest);

  // once node 10.12.0
  // await mkdir(outputDir, { recursive: true });
  await mkdirp(outputDir);

  let element = await this.browser.$('body');

  let screenshot = await this.browser._browser.takeElementScreenshot(element.elementId);
  let screenshotPath = path.join(outputDir, `${title}.png`);
  await writeFile(screenshotPath, screenshot, 'base64');

  let html = await element.getHTML();
  let htmlPath = path.join(outputDir, `${title}.html`);
  await writeFile(htmlPath, html);

  let logTypes = await this.browser._browser.getLogTypes();
  for (let logType of logTypes) {
    let logs = await this.browser._browser.getLogs(logType);
    let logsText = JSON.stringify(logs, null, 2);
    let logPath = path.join(outputDir, `${title}.${logType}.txt`);
    await writeFile(logPath, logsText);
  }
}

module.exports = failureArtifacts;
