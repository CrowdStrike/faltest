'use strict';

const chai = require('chai');

chai.use(require('../packages/chai'));
chai.use(require('chai-string'));
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

module.exports = chai;
