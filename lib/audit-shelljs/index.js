/**
 * Audit directory properties/content with ShellJs
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
'use strict';

module.exports = {
  AuditShelljs: AuditShelljs,
  create: function() { return new AuditShelljs(); },
  mixin: function(ext) { extend(AuditShelljs.prototype, ext); }
};

var requireComponent = require('../component/require');
var extend = requireComponent('extend');
var configurable = requireComponent('configurable.js');

var defShellOpt = {silent: true};

/**
 *
 */
function AuditShelljs() {
  this.settings = {
  };
}

configurable(AuditShelljs.prototype);
