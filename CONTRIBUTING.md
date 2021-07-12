# Contributing Guide

This contains only information related to developing FalTest. For information regarding running the CLI or writing tests, see the [Readme](./README.md).

## Setup

```
git clone git@github.com:CrowdStrike/faltest.git
cd faltest
yarn install
```

## Commands

*   `yarn lint:git` This validates your commit messages for changelog generation. See more [here](#commit-lint).
*   `yarn lint:js` This runs ESLint. See more [here](#linting).
*   `yarn lint:md` This runs Markdown linting using [remark](https://remark.js.org). Add the `-o` option to the end to auto-format (ex. `yarn lint:md -o`).
*   `yarn release` This is what CI runs to publish the package. See more [here](#releasing).
*   `yarn start` This is the same as running `faltest`, but doesn't rely on a global install.
*   `yarn test` This runs the internal test suite.

## Logging

Adding logging via code looks like

```js
const debug = require('./debug');

debug('my basic message');
debug.verbose('my verbose message');
```

and can be used as explained [here](./README.md#logging).

## Linting

Lint rules are stored in [packages/lint/](./packages/lint/). You are encouraged to create a lint rule if there is a bad practice that you want to prevent.

## Commit Lint

CI needs to be able to generate a changelog with the correct fix, feature, and breaking sections, and it does this by failing the build if it can't. It searches your commit for a prefix like "fix:" or "feat:". See [Conventional Commits](https://www.conventionalcommits.org) for more info. The command is `yarn lint:git`.

## Releasing

Merging should be all you have to do to release a new version. CI picks up the merge and publishes to npm for you. It uses the commit hints to generate the correct version and the changelog. If CI fails to publish, you can do it manually via `npm publish`. If you want to release without the help of CI, run `yarn release`.

## Tech Stack

*   [Mocha](https://mochajs.org)
    *   Mocha is the default test runner, but more may be added. The [`roles`](#roles) helper and [feature flags](#feature-flags) `it` support are set up to work like Mocha.
*   [Chai](https://www.chaijs.com)
    *   We use the [`expect`](https://www.chaijs.com/api/bdd) style.
    *   [packages/chai/](./packages/chai/) has some FalTest-specific Chai helpers.
    *   See more [here](./doc/chai.md).
*   [Yargs](http://yargs.js.org)
    *   The CLI arguments are parsed with Yargs.
*   [WebdriverIO](https://webdriver.io)
    *   This is the underlaying framework for sending browser commands.
*   [Standard Version](https://github.com/conventional-changelog/standard-version)
*   [commitlint](https://commitlint.js.org)
*   [ESLint](https://eslint.org)
*   [node-config](https://github.com/lorenwest/node-config)
    *   This handles our roles' login details across environments.
*   [debug](https://github.com/visionmedia/debug)
    *   This handles all of our debug console logging. Some internal WebdriverIO logging is outside of our control.
*   [Sinon.JS](https://sinonjs.org)

## Writing Tests

See [here](./doc/writing-tests.md).

### Browser

See [here](./doc/browser.md).

### Page Objects

See [here](./doc/page-objects.md).

### Tagging

Tagging tests uses the `#` sigil followed by a kebab case name. Tagging happens in a couple different ways.

1.  Including it in test name.
    *   `describe('my test section #my-tag-1 #my-tag-2',`
    *   `it('my test #my-tag-1 #my-tag-2',`
1.  Including a `#` in the test folder. When you use the `describe` that comes from [mocha-helpers](https://github.com/kellyselden/mocha-helpers), the test file path is included in the test name.
    *   `src/acceptance/#my-tag-1/#my-tag-2/my-test.js`
1.  Including it in the [`roles`](#roles) helper. This only supports tags, no plain text allowed. You can't use just any tags in the string, only roles that exist in `config/` are allowed.
    *   `roles('#my-role-1 #my-role-2',`

### Roles

Roles are a special type of [tag](#tagging). You invoke them the same way, using the `--tag` option, but they must map to login details contained in `config/`. You tag tests using the `roles` helper. The `roles` helper binds the tests inside it for each role in the string, array of string or first `n` arguments.

If you have a scenario like

```js
roles('#my-role-1 #my-role-2', function() {
  it('my test', function() {
    // ...
  });
});
```

or

```js
roles('#my-role-1', '#my-role-2', function() {
  it('my test', function() {
    // ...
  });
});
```

You would get two tests

```
#my-role-1
  ✓ my test

#my-role-2
  ✓ my test
```

This system ensures you only ever get one role applied to each test. This also explains why you can't run more than one role at a time (`--tag my-role-1 my-role-2`) because it wouldn't match any tests. You would need a different test run per role. This differs from regular tags in which multiple can match a single test.

### Feature Flags

You can gate a test behind a feature flag. This is useful if certain environments will never have a feature because it wouldn't make sense, or if you are developing a feature, and it is still getting rolled out to the various environments. Adding flags to a test is done using the `it` helper.

Instead of doing this

```js
it('my test', function() {
  // ...
});
```

do this

```js
it({
  name: 'my test',
  flags: ['my-flag-1', 'my-flag-2']
}, function() {
  // ...
});
```

Now this test will be skipped if any of the flags are disabled in your running context.

You can also run tests in the _absence_ of feature flags using the `!` prefix.

```js
it({
  name: 'my test',
  flags: ['!my-flag-1', '!my-flag-2']
}, function() {
  // ...
});
```

This will allow you to properly test the absence of a feature. This will be helpful to prevent regressions on long-lived disabled features.

### Test Filtering

In addition to the CLI filtering, covered [here](./README.md#filtering), you can single out a test in code using Mocha keywords. For any `describe`, `roles`, or `it`, you can add [`.only`](https://mochajs.org/#exclusive-tests) or [`.skip`](https://mochajs.org/#inclusive-tests). The `it`s also support `.allowFail` for known flakey tests via [mocha-helpers](https://github.com/kellyselden/mocha-helpers).

### Network Throttling

Throttling the network is a good technique to detect issues with loading states and race conditions. To avoid opening the devtools and changing the network settings after the tests starts the browser, here are some helpers:

*   `--throttle-network`
    *   This will start throttling the network after logging in for your entire test run.
*   `await this.browser.throttleOn()`
    *   Place this anywhere in your tests to slow down the network.
    *   `await this.browser.throttleOff()` to turn off.
    *   See more [here](./doc/browser.md#throttling)
