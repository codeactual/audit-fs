module.exports = function(grunt) {
  'use strict';

  require('grunt-horde')
    .create(grunt)
    .demand('initConfig.projName', 'audit-shelljs')
    .demand('initConfig.instanceName', 'auditShelljs')
    .demand('initConfig.klassName', 'AuditShelljs')
    .loot('node-component-grunt')
    .attack();
};
