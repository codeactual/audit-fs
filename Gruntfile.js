module.exports = function(grunt) {
  'use strict';

  require('grunt-horde')
    .create(grunt)
    .demand('projName', 'audit-shelljs')
    .demand('instanceName', 'auditShelljs')
    .demand('klassName', 'AuditShelljs')
    .loot('node-component-grunt')
    .attack();
};
