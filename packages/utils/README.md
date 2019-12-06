# @faltest/utils

[![npm version](https://badge.fury.io/js/%40faltest%2Futils.svg)](https://badge.fury.io/js/%40faltest%2Futils)

A wrapper for the [WebdriverIO](https://webdriver.io) `remote` call

Shared utils for [FalTest](https://github.com/CrowdStrike/faltest) packages

```js
const { waitForDownload } = require('@faltest/utils');

await waitForDownload('/path/to/file', optionalTimeout);
```
