'use strict';

const { Element } = require('@faltest/page-objects');

class MemberSection extends Element {
  constructor() {
    super('#member-section', ...arguments);
  }

  get finishedFeature() {
    return this._create('#finished-feature');
  }

  get inProgressFeature() {
    return this._create('#in-progress-feature');
  }
}

module.exports = MemberSection;
