'use strict';

const config = require('config');
const { setUpWebDriver } = require('@faltest/lifecycle');
const {
  createRolesHelper,
  createFlaggedIt,
} = require('@faltest/mocha');

const roles = createRolesHelper(global, role => config.get('roles').get(role));

const featureFlags = [];

const it = createFlaggedIt(global, featureFlags);

module.exports = {
  setUpWebDriver,
  roles,
  featureFlags,
  it,
};
