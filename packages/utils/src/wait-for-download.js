'use strict';

const path = require('path');
const fs = require('fs');
const defaults = require('./defaults');

// https://stackoverflow.com/a/47764403/1703845
async function waitForDownload(filePath, timeout = defaults.timeout) {
  await new Promise((resolve, reject) => {
    let dirPath = path.dirname(filePath);
    let fileName = path.basename(filePath);
    let watcher = fs.watch(dirPath, (event, _fileName) => {
      if (event === 'rename' && _fileName === fileName) {
        clearTimeout(timer);
        watcher.close();
        resolve();
      }
    });

    let timer = setTimeout(() => {
      watcher.close();
      reject(new Error(`${fileName} failed to download in ${timeout}ms`));
    }, timeout);

    fs.access(filePath, fs.constants.R_OK, err => {
      if (!err) {
        clearTimeout(timer);
        watcher.close();
        resolve();
      }
    });
  });
}

module.exports = waitForDownload;
