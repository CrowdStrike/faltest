'use strict';

const { wrap } = require('./mocha');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

function failureArtifacts(outputDir) {
  return test => {
    return function failureArtifacts(...args) {
      function buildTitle(test) {
        let parts = [];

        while (test) {
          if (test.title) {
            parts.unshift(test.title);
          }

          test = test.parent;
        }

        let title = parts.join(' ');

        return title;
      }

      let callback = args.pop();

      return test(...args, async function() {
        try {
          return await callback.apply(this, arguments);
        } catch (err) {
          if (this.browser) {
            let title = buildTitle(this.test);
            try {
              await mkdir(outputDir);
            } catch (err) {}

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
          throw err;
        }
      });
    };
  };
}


function create(mocha, outputDir = process.env.WEBDRIVER_FAILURE_ARTIFACTS_OUTPUT_DIR) {
  if (!outputDir) {
    throw new Error('You must supply an output dir.');
  }

  let __failureArtifacts = failureArtifacts(outputDir);

  return [
    'before',
    'beforeEach',
    'it',
    'afterEach',
    'after',
  ].reduce((hooks, lifecycle) => {
    if (mocha[lifecycle]) {
      hooks[lifecycle] = wrap(mocha[lifecycle], __failureArtifacts);
    }
    return hooks;
  }, {});
}

module.exports = {
  create,
};
