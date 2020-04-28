# eslint-plugin-faltest

[![npm version](https://badge.fury.io/js/eslint-plugin-faltest.svg)](https://badge.fury.io/js/eslint-plugin-faltest)

[ESLint](https://eslint.org) rules for [FalTest](https://github.com/CrowdStrike/faltest)

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-faltest`:

```
$ npm install eslint-plugin-faltest --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-faltest` globally.

## Usage

Add `faltest` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": [
    "faltest"
  ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "faltest/rule-name": 2
  }
}
```

## Supported Rules

*   Enforce using `eventually` when querying page objects or the browser ([chai-webdriver-eventually](./doc/rules/chai-webdriver-eventually.md))
*   Prevent accidental check-in of `roles.only` ([mocha-roles-only](./doc/rules/mocha-roles-only.md))
*   Prevent accidental check-in of network throttling ([no-browser-throttle](./doc/rules/no-browser-throttle.md))
*   Enforce using the Chai methods provided by [@faltest/chai](../chai) ([use-chai-methods](./doc/rules/use-chai-methods.md))
