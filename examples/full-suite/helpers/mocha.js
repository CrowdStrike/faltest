'use strict';

const config = require('config');
const { setUpWebDriver } = require('@faltest/lifecycle');
const {
  createRolesHelper,
  createFlaggedTest,
  createFailureArtifactsHelpers,
} = require('@faltest/mocha');

const roles = createRolesHelper(global.describe, role => config.get('roles').get(role));

const featureFlags = [];

const it = createFlaggedTest(global.it, featureFlags);

const hooks = createFailureArtifactsHelpers({
  before: global.before,
  beforeEach: global.beforeEach,
  it,
  afterEach: global.afterEach,
  after: global.after,
});

module.exports = {
  setUpWebDriver,
  roles,
  featureFlags,
  ...hooks,
};
