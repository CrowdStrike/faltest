# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [8.1.0](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@8.0.2...@faltest/lifecycle@8.1.0) (2023-03-04)


### Features

* call `waitForPromisesToFlushBetweenTests` in every lifecycle hook ([838a113](https://github.com/CrowdStrike/faltest/commit/838a113fa9c7462cd39d4a7d802c6c5009c39f56))

### [8.0.2](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@8.0.1...@faltest/lifecycle@8.0.2) (2023-03-04)

### [8.0.1](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@8.0.0...@faltest/lifecycle@8.0.1) (2023-02-28)


### Bug Fixes

* call `waitForPromisesToFlushBetweenTests` in `setUpWebDriverBeforeEach` ([c51f96e](https://github.com/CrowdStrike/faltest/commit/c51f96e61da1365a1bfe80108f1811f25644cb66))

## [8.0.0](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@7.0.4...@faltest/lifecycle@8.0.0) (2023-01-19)


### ⚠ BREAKING CHANGES

* use events-async instead of home-grown solution

* use events-async instead of home-grown solution ([95a246b](https://github.com/CrowdStrike/faltest/commit/95a246b3c25f588536b43fb7b394bb4865fc1398))

### [7.0.4](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@7.0.3...@faltest/lifecycle@7.0.4) (2023-01-13)


### Bug Fixes

* reset sessionError in beforeAll ([096de01](https://github.com/CrowdStrike/faltest/commit/096de016541fcbcf5f803f68567b9f7acc315c51))

### [7.0.3](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@7.0.2...@faltest/lifecycle@7.0.3) (2022-12-12)

### [7.0.2](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@7.0.1...@faltest/lifecycle@7.0.2) (2022-10-03)

## [7.0.0](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@6.0.3...@faltest/lifecycle@7.0.0) (2022-07-23)


### ⚠ BREAKING CHANGES

* bump to node 14

### Features

* bump to node 14 ([0ac77c3](https://github.com/CrowdStrike/faltest/commit/0ac77c3b980a3c6835b77c9557e511ba13fc1b59))

### [6.0.3](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@6.0.2...@faltest/lifecycle@6.0.3) (2022-01-31)

### [6.0.2](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@6.0.1...@faltest/lifecycle@6.0.2) (2022-01-24)

### [6.0.1](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@6.0.0...@faltest/lifecycle@6.0.1) (2021-11-30)

## [6.0.0](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@5.0.2...@faltest/lifecycle@6.0.0) (2021-06-15)


### ⚠ BREAKING CHANGES

* bump node 12

### Features

* bump node 12 ([74a3fd0](https://github.com/CrowdStrike/faltest/commit/74a3fd06f787685cf543d5725f0b45ae4215fcf5))

### [5.0.2](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@5.0.1...@faltest/lifecycle@5.0.2) (2021-06-15)

### [5.0.1](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@5.0.0...@faltest/lifecycle@5.0.1) (2021-04-16)

## [5.0.0](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@4.1.0...@faltest/lifecycle@5.0.0) (2021-01-05)


### ⚠ BREAKING CHANGES

* bump all packages to node 10

* bump all packages to node 10 ([17cd7c0](https://github.com/CrowdStrike/faltest/commit/17cd7c0173a4c57e15b1b187b73411c4e466b9b0))

## [4.1.0](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@4.0.2...@faltest/lifecycle@4.1.0) (2020-08-28)


### Features

* allow overriding the default timeout ([9302cfa](https://github.com/CrowdStrike/faltest/commit/9302cfafdb4592071adf8077735711decdf091e4))
* allow overriding the mocha hook source ([809f664](https://github.com/CrowdStrike/faltest/commit/809f6644bfab8621387ae67e9312d340cc677ce4))

### [4.0.2](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@4.0.1...@faltest/lifecycle@4.0.2) (2020-08-20)


### Bug Fixes

* prevents "stale element reference" errors ([5934995](https://github.com/CrowdStrike/faltest/commit/59349956382b9c134f6f52341d9792a166568317))

### [4.0.1](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@4.0.0...@faltest/lifecycle@4.0.1) (2020-08-20)


### Bug Fixes

* remove unused debug file ([002e25f](https://github.com/CrowdStrike/faltest/commit/002e25fa948ee0bdc82f829b5f86095c8c0d5b12))

## [4.0.0](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@3.2.7...@faltest/lifecycle@4.0.0) (2020-08-19)


### ⚠ BREAKING CHANGES

* failure artifacts are now handled in `@faltest/mocha`.

### Features

* remove failure artifact handling ([aff0b46](https://github.com/CrowdStrike/faltest/commit/aff0b469e374846cbc58643777c112fb6114c910))

### [3.2.7](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@3.2.6...@faltest/lifecycle@3.2.7) (2020-08-19)


### Bug Fixes

* correctly handle failure artifacts in `before` and `after` ([8f5017d](https://github.com/CrowdStrike/faltest/commit/8f5017d3cc0d19b607908d5ad37b91196bd87993))

### [3.2.6](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@3.2.5...@faltest/lifecycle@3.2.6) (2020-08-12)


### Bug Fixes

* don't create failure artifacts for `this.skip` tests ([054b8f4](https://github.com/CrowdStrike/faltest/commit/054b8f4339e30534a0aecf6ccccf9e06d240cdc0))

### [3.2.5](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@3.2.4...@faltest/lifecycle@3.2.5) (2020-08-10)


### Bug Fixes

* handle failure artifacts in `beforeEach` correctly ([094e2a9](https://github.com/CrowdStrike/faltest/commit/094e2a9086f3b193103ec5cc1e15b5f9de4cdd1a))

### [3.2.4](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@3.2.3...@faltest/lifecycle@3.2.4) (2020-08-10)


### Bug Fixes

* use the new failure artifacts API ([dae48f6](https://github.com/CrowdStrike/faltest/commit/dae48f6525b4eeb6da97eac1a8cc455eb89a2d48))

### [3.2.3](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@3.2.2...@faltest/lifecycle@3.2.3) (2020-07-07)


### Bug Fixes

* remove `node-config` assumption from roles ([b0f58ab](https://github.com/CrowdStrike/faltest/commit/b0f58ab328a2e440f683a6b86c3442b195eafc14))

### [3.2.2](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@3.2.1...@faltest/lifecycle@3.2.2) (2020-06-09)


### Bug Fixes

* add `enabled` flag to `createFailureArtifactsHelpers` ([bbff9b0](https://github.com/CrowdStrike/faltest/commit/bbff9b0e173cb7391e90156f2fe894614cd8c172))

### [3.2.1](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@3.2.0...@faltest/lifecycle@3.2.1) (2020-06-09)


### Bug Fixes

* remove redundant `WEBDRIVER_FAILURE_ARTIFACTS_OUTPUT_DIR` ([d18da33](https://github.com/CrowdStrike/faltest/commit/d18da33c8df8d31d2c66c3f9c5d91be7c4378efb))

## [3.2.0](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@3.1.0...@faltest/lifecycle@3.2.0) (2020-06-09)


### Features

* add failure artifacts to tests ([a3023ef](https://github.com/CrowdStrike/faltest/commit/a3023efca010d2d25a6e537a7ced93c9eba425ba))

## [3.1.0](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@3.0.1...@faltest/lifecycle@3.1.0) (2020-06-05)


### Features

* add `faltestOptions` to test context ([b0bd065](https://github.com/CrowdStrike/faltest/commit/b0bd065e7e8b32f1f4c153e4304a9e604884027e))

### [3.0.1](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@3.0.0...@faltest/lifecycle@3.0.1) (2020-06-05)


### Bug Fixes

* use the newer kill-orphans event ([8e56c26](https://github.com/CrowdStrike/faltest/commit/8e56c2657a5d452c7c55ac40ecdb2974f83d98a9))

## [3.0.0](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.15...@faltest/lifecycle@3.0.0) (2020-06-05)


### ⚠ BREAKING CHANGES

* the event signature changed

### Features

* update to the new event syntax ([f6c71e5](https://github.com/CrowdStrike/faltest/commit/f6c71e5782da68646ca36df8401479fa59845838))

### [2.0.15](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.14...@faltest/lifecycle@2.0.15) (2020-04-09)


### Bug Fixes

* recover after login failure ([243aa8c](https://github.com/CrowdStrike/faltest/commit/243aa8ca4f6e9a41b130cc1bc8ca0fa4864f0919))

### [2.0.14](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.13...@faltest/lifecycle@2.0.14) (2020-04-09)


### Bug Fixes

* init-context doesn't need to be called twice per test ([368c8aa](https://github.com/CrowdStrike/faltest/commit/368c8aafaa96c3c10818a676fc858213713aaf69))

### [2.0.13](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.12...@faltest/lifecycle@2.0.13) (2020-02-21)

### [2.0.12](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.11...@faltest/lifecycle@2.0.12) (2020-01-27)


### Bug Fixes

* bring back `reporterOptions` ([313024e](https://github.com/CrowdStrike/faltest/commit/313024e9057620f353e68666d05cb1a6890dea5c))

### [2.0.11](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.10...@faltest/lifecycle@2.0.11) (2020-01-13)

### [2.0.10](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.9...@faltest/lifecycle@2.0.10) (2020-01-09)

### [2.0.9](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.8...@faltest/lifecycle@2.0.9) (2020-01-09)

### [2.0.8](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.7...@faltest/lifecycle@2.0.8) (2020-01-06)

### [2.0.7](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.6...@faltest/lifecycle@2.0.7) (2020-01-02)

### [2.0.6](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.5...2.0.6) (2019-12-11)


### Bug Fixes

* broken release ([b629a5b](https://github.com/CrowdStrike/faltest/commit/b629a5ba02391d7c3992ccfa1bba95023088064b))

### [2.0.5](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.4...2.0.5) (2019-12-11)

### [2.0.4](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.3...2.0.4) (2019-12-10)

### [2.0.3](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.2...2.0.3) (2019-12-10)

### [2.0.2](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.1...2.0.2) (2019-12-10)


### Bug Fixes

* recycle state if overrides change ([8988d72](https://github.com/CrowdStrike/faltest/commit/8988d725eb4272bb6add7a6b673cd5c9b39661df))

### [2.0.1](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@2.0.0...2.0.1) (2019-12-06)

## [2.0.0](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.3.8...2.0.0) (2019-12-06)


### ⚠ BREAKING CHANGES

* remote api change
startWebDriver and startBrowser now take whole options object instead of just overrides.

### Features

* allow modifying capabilities via `customizeCapabilities` ([7683fd3](https://github.com/CrowdStrike/faltest/commit/7683fd39be42d5e8a8740c33d8c3cc8a34a77b99))

### [1.3.8](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.3.7...1.3.8) (2019-10-27)

### [1.3.7](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.3.6...1.3.7) (2019-10-21)


### Bug Fixes

* extract `loggedInRole` modifications ([b4a38c6](https://github.com/CrowdStrike/faltest/commit/b4a38c6))

### [1.3.6](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.3.5...1.3.6) (2019-10-21)


### Bug Fixes

* call log in and out once for every browser ([6928171](https://github.com/CrowdStrike/faltest/commit/6928171))
* extract `logIn` and `logOut` ([09222d7](https://github.com/CrowdStrike/faltest/commit/09222d7))

### [1.3.5](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.3.4...1.3.5) (2019-10-21)


### Bug Fixes

* throttle all browsers ([c43b5af](https://github.com/CrowdStrike/faltest/commit/c43b5af))

### [1.3.4](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.3.3...1.3.4) (2019-10-21)


### Bug Fixes

* send the new plural events no matter what ([fca7243](https://github.com/CrowdStrike/faltest/commit/fca7243))

### [1.3.3](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.3.2...1.3.3) (2019-10-21)

### [1.3.2](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.3.1...1.3.2) (2019-10-08)


### Bug Fixes

* `WEBDRIVER_BROWSERS` could be a string ([03a5f78](https://github.com/CrowdStrike/faltest/commit/03a5f78))
* use `Array.fill` for browser looping ([c32589b](https://github.com/CrowdStrike/faltest/commit/c32589b))

### [1.3.1](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.3.0...1.3.1) (2019-10-07)


### Bug Fixes

* multi line the browser override ([2ec694b](https://github.com/CrowdStrike/faltest/commit/2ec694b))

## [1.3.0](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.2.0...1.3.0) (2019-10-07)


### Features

* add multi browser support to the cli ([38b118c](https://github.com/CrowdStrike/faltest/commit/38b118c))

## [1.2.0](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.1.1...1.2.0) (2019-10-07)


### Features

* support multiple browsers in lifecycle ([78e21bb](https://github.com/CrowdStrike/faltest/commit/78e21bb))

### [1.1.1](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.1.0...1.1.1) (2019-10-01)

## [1.1.0](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.0.4...1.1.0) (2019-09-30)


### Features

* extract utils ([744588c](https://github.com/CrowdStrike/faltest/commit/744588c))

### [1.0.4](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.0.3...1.0.4) (2019-09-28)

### [1.0.3](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.0.2...1.0.3) (2019-09-28)

### [1.0.2](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.0.1...1.0.2) (2019-09-27)

### [1.0.1](https://github.com/CrowdStrike/faltest/compare/@faltest/lifecycle@1.0.0...1.0.1) (2019-09-12)
