'use strict';

const config = require('config');
const { setUpWebDriver } = require('@faltest/lifecycle');
const {
  createRolesHelper,
  createFlaggedTest,
} = require('@faltest/mocha');

const roles = createRolesHelper(global, role => config.get('roles').get(role));

const featureFlags = [];

const it = createFlaggedTest(global, featureFlags);

module.exports = {
  setUpWebDriver,
  roles,
  featureFlags,
  it,
};
