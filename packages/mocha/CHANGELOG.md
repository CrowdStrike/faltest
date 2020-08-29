# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.1.0](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@4.0.1...@faltest/mocha@4.1.0) (2020-08-29)


### Features

* add a `--dry-run` option ([aa6dc5a](https://github.com/CrowdStrike/faltest/commit/aa6dc5a007fd6d20e3428a0e3231e4ec1aedf4a1))

### [4.0.1](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@4.0.0...@faltest/mocha@4.0.1) (2020-08-28)


### Bug Fixes

* clear logs between tests to improve failure logs ([91fca85](https://github.com/CrowdStrike/faltest/commit/91fca85334470e68638332c1f60a463237c002a9))

## [4.0.0](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@3.2.0...@faltest/mocha@4.0.0) (2020-08-26)


### ⚠ BREAKING CHANGES

* The first param of `createRolesHelper` and `createFlaggedTest` has changed to be the object source of the mocha hooks (usually `global`).

### Bug Fixes

* defer accessing mocha hooks until needed ([8eb4625](https://github.com/CrowdStrike/faltest/commit/8eb46256c72234069c1350355f691d8a94b37b42))

## [3.2.0](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@3.1.4...@faltest/mocha@3.2.0) (2020-08-24)


### Features

* add retried test logging ([4cc7c26](https://github.com/CrowdStrike/faltest/commit/4cc7c2695848a5f885fd59196c09be79a83d5136))

### [3.1.4](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@3.1.3...@faltest/mocha@3.1.4) (2020-08-20)


### Bug Fixes

* clean up `promisesToFlushBetweenTests` ([dbe0f69](https://github.com/CrowdStrike/faltest/commit/dbe0f69e43fe004af24dc54022628957f5729c28))

### [3.1.3](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@3.1.2...@faltest/mocha@3.1.3) (2020-08-20)


### Bug Fixes

* prevents "stale element reference" errors ([5934995](https://github.com/CrowdStrike/faltest/commit/59349956382b9c134f6f52341d9792a166568317))

### [3.1.2](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@3.1.1...@faltest/mocha@3.1.2) (2020-08-20)


### Bug Fixes

* gracefully handle errors in `failureArtifacts` ([69f5968](https://github.com/CrowdStrike/faltest/commit/69f59682eca23683cff440643532427a72513e4d))

### [3.1.1](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@3.1.0...@faltest/mocha@3.1.1) (2020-08-20)


### Bug Fixes

* add more logging ([0981681](https://github.com/CrowdStrike/faltest/commit/098168167e725d516edcd3757abf191c12981fc4))

## [3.1.0](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@3.0.0...@faltest/mocha@3.1.0) (2020-08-20)


### Features

* log failure artifact file path ([dfdf334](https://github.com/CrowdStrike/faltest/commit/dfdf334200ca542fd178e2471c3cde9da356d671))

## [3.0.0](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@2.0.4...@faltest/mocha@3.0.0) (2020-08-19)


### ⚠ BREAKING CHANGES

* The implementation of `failureArtifacts` has different assumptions, and `failureArtifacts` is no longer exported.

### Features

* use mocha events to handle failure artifacts ([d1068e2](https://github.com/CrowdStrike/faltest/commit/d1068e20947131b6f626796b49884ff5fd7d009f))

### [2.0.4](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@2.0.3...@faltest/mocha@2.0.4) (2020-08-19)


### Bug Fixes

* correctly handle failure artifacts in `before` and `after` ([8f5017d](https://github.com/CrowdStrike/faltest/commit/8f5017d3cc0d19b607908d5ad37b91196bd87993))

### [2.0.3](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@2.0.2...@faltest/mocha@2.0.3) (2020-08-13)


### Bug Fixes

* fix test typos ([42c9980](https://github.com/CrowdStrike/faltest/commit/42c9980b79b8cce5bc4f9ec5ecdd7d09ae6fe5a2))
* use `mkdirp` for nested failure artifact dirs ([ef54a93](https://github.com/CrowdStrike/faltest/commit/ef54a93dd8cab35a97e8b415ad40b5239b8b24c9))

### [2.0.2](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@2.0.1...@faltest/mocha@2.0.2) (2020-08-12)


### Bug Fixes

* don't create failure artifacts for `this.skip` tests ([054b8f4](https://github.com/CrowdStrike/faltest/commit/054b8f4339e30534a0aecf6ccccf9e06d240cdc0))

### [2.0.1](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@2.0.0...@faltest/mocha@2.0.1) (2020-08-10)


### Bug Fixes

* handle failure artifacts in `beforeEach` correctly ([094e2a9](https://github.com/CrowdStrike/faltest/commit/094e2a9086f3b193103ec5cc1e15b5f9de4cdd1a))

## [2.0.0](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.1.2...@faltest/mocha@2.0.0) (2020-08-10)


### ⚠ BREAKING CHANGES

* `createFailureArtifacts` was removed because it is no longer necessary.

### Features

* optimize failure artifacts ([f5dcb2a](https://github.com/CrowdStrike/faltest/commit/f5dcb2a370517c18d25c83417f8aca6601e44f5a))

### [1.1.2](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.1.1...@faltest/mocha@1.1.2) (2020-08-07)


### Bug Fixes

* sanitise test names with / for filenames ([4d376cf](https://github.com/CrowdStrike/faltest/commit/4d376cf2212d45a458bf3269bd71ff9a7a0ed088))

### [1.1.1](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.1.0...@faltest/mocha@1.1.1) (2020-06-09)


### Bug Fixes

* add `enabled` flag to `createFailureArtifactsHelpers` ([bbff9b0](https://github.com/CrowdStrike/faltest/commit/bbff9b0e173cb7391e90156f2fe894614cd8c172))

## [1.1.0](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.0.11...@faltest/mocha@1.1.0) (2020-06-09)


### Features

* add failure artifacts to tests ([a3023ef](https://github.com/CrowdStrike/faltest/commit/a3023efca010d2d25a6e537a7ced93c9eba425ba))

### [1.0.11](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.0.10...@faltest/mocha@1.0.11) (2020-06-05)

### [1.0.10](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.0.9...@faltest/mocha@1.0.10) (2020-03-12)


### Bug Fixes

* update min `mocha-helpers` version ([c4c7e96](https://github.com/CrowdStrike/faltest/commit/c4c7e96508b76fae88f2065a2ed2656c6c4c393c))

### [1.0.9](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.0.8...@faltest/mocha@1.0.9) (2020-01-27)


### Bug Fixes

* bring back `reporterOptions` ([313024e](https://github.com/CrowdStrike/faltest/commit/313024e9057620f353e68666d05cb1a6890dea5c))

### [1.0.8](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.0.7...@faltest/mocha@1.0.8) (2020-01-13)


### Bug Fixes

* use documented `reporterOption` ([0e2cf10](https://github.com/CrowdStrike/faltest/commit/0e2cf10562ff342a2365c1d1287ed1d9c19d1d75)), closes [/github.com/mochajs/mocha/issues/4142#issuecomment-573295470](https://github.com/CrowdStrike//github.com/mochajs/mocha/issues/4142/issues/issuecomment-573295470)

### [1.0.7](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.0.6...@faltest/mocha@1.0.7) (2020-01-09)

### [1.0.6](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.0.5...@faltest/mocha@1.0.6) (2020-01-06)


### Bug Fixes

* relax mocha peer dep constraint ([7857ec0](https://github.com/CrowdStrike/faltest/commit/7857ec083be2867eec901d737954c3cc7d56201c))

### [1.0.5](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.0.4...1.0.5) (2019-12-06)


### Bug Fixes

* fix tag substring regex ([260bfd0](https://github.com/CrowdStrike/faltest/commit/260bfd0d3e1a2097750c9efd4f55ed137b5eb1d7))

### [1.0.4](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.0.3...1.0.4) (2019-11-21)


### Bug Fixes

* fix for tag substrings ([f2756d4](https://github.com/CrowdStrike/faltest/commit/f2756d4b4026a75a2b93f593d60aa28585553c65))

### [1.0.3](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.0.2...1.0.3) (2019-10-27)


### Bug Fixes

* add retries test ([0f66434](https://github.com/CrowdStrike/faltest/commit/0f66434))

### [1.0.2](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.0.1...1.0.2) (2019-10-21)


### Bug Fixes

* update fix for `mocha-helpers` ([211e48e](https://github.com/CrowdStrike/faltest/commit/211e48e))

### [1.0.1](https://github.com/CrowdStrike/faltest/compare/@faltest/mocha@1.0.0...1.0.1) (2019-09-12)
