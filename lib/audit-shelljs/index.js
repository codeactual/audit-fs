/**
 * Audit directory properties/content with ShellJs
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
'use strict';

var rules = {};

module.exports = {
  AuditShelljs: AuditShelljs,
  rules: rules,
  create: function() { return new AuditShelljs(); },
  extendAuditShelljs: function(ext) { extend(AuditShelljs.prototype, ext); }
};

var requireComponent = require('../component/require');
var extend = requireComponent('extend');
var configurable = requireComponent('configurable.js');

function AuditShelljs() {
  this.settings = {
    dir: process.cwd()
  };

  this.shelljs = require('outer-shelljs').create();
  this.tests = [];
  this.results = [];
  this.match = true;
}

AuditShelljs.createQueuePush = function(name, cb) {
  return function() {
    this.tests.push({name: name, cb: cb, args: [].slice.call(arguments)});
    return this;
  };
};

configurable(AuditShelljs.prototype);

AuditShelljs.prototype.failReason = function() {
  return this.results[this.results.length - 1];
};

AuditShelljs.prototype.hit = function() {
  var self = this;
  this.shelljs._('cd', this.get('dir'));
  this.tests.forEach(function(test) {
    test.cb.apply(self, test.args);
  });
  return this.match;
};

AuditShelljs.prototype.resolve = function(relPath) {
  return this.get('dir') + '/' + relPath;
};

rules.custom = function() {
  return this.shelljs._.apply(this.shelljs, arguments);
};

rules.grep = function(text, regex) {
  return this.shelljs._('grep', text, regex);
};

rules.grepv = function(text, regex) {
  return this.shelljs._('grep', '-v', text, regex);
};

rules.hasDir = function(dir) {
  return this.shelljs._('test', '-d', this.resolve(dir));
};

rules.hasFile = function(file) {
  return this.shelljs._('test', '-f', this.resolve(file));
};

Object.keys(rules).forEach(function(name) {
  AuditShelljs.prototype[name] = AuditShelljs.createQueuePush(name, function() {
    if (!this.match) { return; } // Prior test already failed the audit
    var res = rules[name].apply(this, arguments);
    this.results.push({name: name, args: arguments, res: res});
    this.match = this.match && res;
  });
});
