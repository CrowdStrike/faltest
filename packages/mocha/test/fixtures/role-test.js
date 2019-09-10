'use strict';

const assert = require('assert');
const { createRolesHelper } = require('../../src');

const roles = createRolesHelper(describe, role => role);

describe('role', function() {
  roles('#role1', function() {
    it('works', function() {
      assert.strictEqual(this.role, 'role1');
    });
  });

  roles('#role2', function() {
    it('works', function() {
      assert.strictEqual(this.role, 'role2');
    });
  });

  roles('#role3', function() {
    it('works', function() {
      assert.strictEqual(this.role, 'role3');
    });
  });
});
