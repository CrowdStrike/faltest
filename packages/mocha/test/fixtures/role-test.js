'use strict';

const assert = require('assert');
const { createRolesHelper } = require('../../src');

const roles = createRolesHelper(global, role => role);

describe('role', function() {
  roles('#role1', function() {
    it('works', function() {
      assert.strictEqual(this.role, 'role1');
    });
  });

  roles('#role2 #role3', function() {
    it('works', function() {
      assert.ok(this.role.match(/role[2|3]/));
    });
  });

  roles('#role4', '#role5', '#role6', function() {
    it('works', function() {
      assert.ok(this.role.match(/role[4|5|6]/));
    });
  });
});
