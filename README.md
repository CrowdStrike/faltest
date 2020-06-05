# FalTest

[![Build Status](https://travis-ci.org/CrowdStrike/faltest.svg?branch=master)](https://travis-ci.org/CrowdStrike/faltest)
[![Build status](https://ci.appveyor.com/api/projects/status/ugj6vwro6p3w4gea/branch/master?svg=true)](https://ci.appveyor.com/project/CrowdStrike/faltest/branch/master)

A different take on [WebDriver](https://www.w3.org/TR/webdriver1) browser testing

## Requirements

Make sure [Node.js](https://nodejs.org) 8.10+ is installed.

## Setup

Run the following command to install FalTest globally.

```
npm install --global @faltest/cli
```

## Usage

Here are a couple examples of using the FalTest CLI.

*   `faltest --tag admin !smoke --filter "^Visit .*"`
*   `faltest --env dev --tag smoke --share-session --headless`

## Default Options

(regen using `yarn start --help`)

```
  --help                          Show help                            [boolean]
  --version                       Show version number                  [boolean]
  --browser                       Type of browser to run
                     [string] [choices: "chrome", "firefox"] [default: "chrome"]
  --browsers                      Number of browsers to run         [default: 1]
  --port                          Port for WebDriver     [string] [default: "0"]
  --headless                      Run browser in headless mode
                                                      [boolean] [default: false]
  --retries                       When all else fails, try again!   [default: 0]
  --target                        Run against a different UI server/URL
                              [string] [choices: "default"] [default: "default"]
  --env                           Run against a different data source
                              [string] [choices: "default"] [default: "default"]
  --share-webdriver               Keep the WebDriver process open between test
                                  runs                 [boolean] [default: true]
  --keep-browser-open             Keep the browser open between test runs (sets
                                  --share-webdriver)  [boolean] [default: false]
  --share-session                 Keep the session (login, etc.) between test
                                  runs (sets --share-webdriver and
                                  --keep-browser-open)[boolean] [default: false]
  --size                          Override the browser size. ex. "--size 1024
                                  768"
  --throttle-network              Slow down the network so you can see the
                                  loading states better
                                                      [boolean] [default: false]
  --tag                           Filter groups of tests using the #hash tagging
                                  system (hashes are optional). Prefix with ! to
                                  negate.      [array] [choices: ] [default: []]
  --filter                        Filter the tests by name using a pattern
                                                        [string] [default: ".*"]
  --random                        Randomise test order[boolean] [default: false]
  --seed                          Set the random seed to reproduce test order
                                                                        [string]
  --timeouts-override             Override all Mocha timeouts for debugging
                                  purposes
  --disable-timeouts              Disable all Mocha timeouts for debugging
                                  purposes            [boolean] [default: false]
  --disable-cleanup               Disables all browser cleanup. Run
                                  `faltest-kill-orphans` to clean up manually.
                                                      [boolean] [default: false]
  --failure-artifacts             Save screenshots, html, and logs on test
                                  failure             [boolean] [default: false]
  --failure-artifacts-output-dir  Location to save failure artifacts    [string]
  --reporter                      Change the Mocha reporter             [string]
  --reporter-options              Supply Mocha reporter options         [string]
```

## Filtering

There are a couple ways to filter tests, `--tag` and `--filter`. Tags are predefined categories you can add to narrow down your test run. This includes filtering by roles. You can also prefix a `!` to a tag (ex. `--tag !smoke`) if you want to exclude it. If you are using Bash, you may need to escape the exclamation mark (ex. `--tag \!smoke`). The filter is a regular expression that can match test names. You can combine both these options.

Filtering by tags is a little different between roles and other tags. Since a test only ever has one role at a time attached to it, `--tag role1 role2` would never match any tests, since tags function as a logical AND and not an OR. On the other hand, tests can be attached to more than one tag. In this case, `--tag tag1 tag2` would target those tests only, and exclude the tests focusing on either tag exclusively.

## Logging

Logging can be accomplished via the `DEBUG` environment variable (<https://github.com/visionmedia/debug>). Supported variables are:

*   `@faltest/remote,@faltest/lifecycle,...` - basic logging
*   `@faltest/remote:verbose,...` - verbose logging __only__
*   `@faltest*` - all logging

An example use would be `DEBUG=@faltest* faltest --tag smoke`.

## Failure Artifacts

Using the options `--failure-artifacts` and `--failure-artifacts-output-dir`, you can get screenshots, html, and browser logs of test failures.

## Browser Versions

To override the [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/) version to match your [Chrome](https://www.google.com/chrome) version, follow the guide [here](https://github.com/giggio/node-chromedriver#versioning) or [here](https://github.com/giggio/node-chromedriver#detect-chromedriver-version). For example:

```
DETECT_CHROMEDRIVER_VERSION=true npm install
```

## Real-world Examples

*   [emberclear](https://github.com/NullVoxPopuli/emberclear/blob/master/packages/smoke-tests/tests/smoke-test.js)
*   [ember-aframe-shim](https://github.com/ember-vr/ember-aframe-shim/blob/master/faltest/smoke-test.js)

## Contributing

If you need to change FalTest, see [Contributing Guide](./CONTRIBUTING.md).
