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

/**
 *
 */
function AuditShelljs() {
  this.settings = {
    dir: process.cwd()
  };

  this.shelljs = require('outer-shelljs').create();
  this.tests = [];
  this.results = [];
  this.match = true;

  this.hasDir('');
}

configurable(AuditShelljs.prototype);

AuditShelljs.createAuditor = function(name, cb) {
  return function() {
    this.tests.push({name: name, cb: cb, args: arguments});
    return this;
  };
};

AuditShelljs.prototype.hit = function() {
  var self = this;

  this.shelljs._('cd', this.get('dir'));

  this.tests.forEach(function(test) {
    test.cb.apply(self, test.args);
  });
  return this.match;
};

AuditShelljs.prototype.failReason = function() {
  return this.results[this.results.length - 1];
};

AuditShelljs.prototype.resolve = function(relPath) {
  return this.get('dir') + '/' + relPath;
};

var tests = {};

tests.custom = function() {
  return this.shelljs._.apply(this.shelljs, arguments);
};

/**
 * Verify a callback's truthy return value.
 *
 * @param {function} cb Receives one argument: AuditShelljs's OuterShelljs instance.
 * @return {boolean}
 */
tests.assert = function(cb) {
  return !!cb.call(this.shelljs);
};

/**
 * Negated assert() wrapper.
 */
tests.refute = function(cb) {
  return !this.assert(cb);
};

tests.hasFile = function(file) {
  return this.custom('test', '-f', this.resolve(file));
};

tests.hasDir = function(dir) {
  return this.shelljs._('test', '-d', this.resolve(dir));
};

tests.grep = function(text, regex) {
  return this.shelljs._('grep', text, regex);
};

tests.grepv = function(text, regex) {
  return this.shelljs._('grep', '-v', text, regex);
};

Object.keys(tests).forEach(function(name) {
  AuditShelljs.prototype[name] = AuditShelljs.createAuditor(name, function() {
    if (!this.match) { return; } // Prior test already failed the audit
    var res = tests[name].apply(this, arguments);
    this.results.push({name: name, args: arguments, res: res});
    this.match = this.match && res;
  });
});
