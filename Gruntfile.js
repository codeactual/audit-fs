module.exports = function(grunt) {
  'use strict';

  require('grunt-horde')
    .create(grunt)
    .demand('initConfig.projName', 'audit-fs')
    .demand('initConfig.instanceName', 'auditFs')
    .demand('initConfig.klassName', 'AuditFs')
    .loot('node-component-grunt')
    .attack();
};
