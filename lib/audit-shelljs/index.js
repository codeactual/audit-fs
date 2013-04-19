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
  extendAuditShelljs: function(ext) { extend(AuditShelljs.prototype, ext); },
  extendRules: function(ext) { extend(rules, ext); }
};

var requireComponent = require('../component/require');
var extend = requireComponent('extend');
var configurable = requireComponent('configurable.js');

function AuditShelljs() {
  var self = this;

  this.settings = {
    dir: process.cwd()
  };

  this.shelljs = require('outer-shelljs').create();

  // One object per executed test. Properties:
  // {string} name Ex. 'hasFile'
  // {function} cb Name-specific test function from createTester()
  // {mixed} res Ex. ShellJS test() boolean result
  this.tests = [];

  // One object per executed test. Properties:
  // {string} name Ex. 'hasFile'
  // {array} args Ex. arguments passed to hasFile()
  // {mixed} res Ex. ShellJS test() boolean result
  this.results = [];

  this.match = true; // True if 0 executed tests failed

  // Augment method set manually rather than w/ prototype because
  // rule set may have been extended.
  Object.keys(rules).forEach(function(name) {
    self[name] = AuditShelljs.createQueuePush(name, AuditShelljs.createTester(name));
  });
}

/**
 * Wrap execution of a test function, like hasFile(), so we can define common
 * before/after operations like tracking results, avoiding unnecessary tests, etc.
 *
 * @param {string} name Ex. 'hasFile'
 * @return {function} Expects the same arguments as the named test.
 */
AuditShelljs.createTester = function(name) {
  return function() {
    if (!this.match) { return; } // Prior test already failed the audit
    var res = rules[name].apply(this, arguments);
    this.results.push({name: name, args: arguments, res: res});
    this.match = this.match && res;
  };
};

/**
 * Create a function that enqueues a test method invocation.
 * Allows composition of directory expectations via fluent interface.
 *
 * @param {string} name Ex. 'hasFile'
 * @return {function}
 *   Expects the same arguments as the named test.
 *   Returns a reference to the current AuditShelljs instance.
 */
AuditShelljs.createQueuePush = function(name, cb) {
  return function() {
    this.tests.push({name: name, cb: cb, args: [].slice.call(arguments)});
    return this;
  };
};

configurable(AuditShelljs.prototype);

/**
 * Return the result of the last executed test.
 *
 * @return {mixed} Result object, or undefined if none were executed.
 */
AuditShelljs.prototype.last = function() {
  return this.results[this.results.length - 1];
};

/**
 * Run queued tests and return the result. Stop at first failure.
 *
 * @return {boolean} True if all tests passed.
 */
AuditShelljs.prototype.pass = function() {
  var self = this;
  this.shelljs._('cd', this.get('dir'));
  this.tests.forEach(function(test) {
    test.cb.apply(self, test.args);
  });
  return this.match;
};

/**
 * Resolve a path relative to the configured target dir.
 *
 * @param {string} relPath
 * @return [string}]
 */
AuditShelljs.prototype.resolve = function(relPath) {
  return this.get('dir') + '/' + relPath;
};

/**
 * Truthy-test a custom OuterShelljs invocation.
 */
rules._ = function() {
  return !!this.shelljs._.apply(this.shelljs, arguments);
};

/**
 * Truthy-test a custom function invocation.
 *
 * @param {function} cb
 *   Receives one argument: OuterShelljs instance.
 *   Return value is used as the test result.
 */
rules.assert = function(cb) { return !!cb(this.shelljs); };
rules.refute = function(cb) { return !cb(this.shelljs); };

/**
 * Convenience wrappers.
 */
rules.grep = function(text, regex) { return !!this.shelljs._('grep', text, regex); };
rules.grepv = function(text, regex) { return !!this.shelljs._('grep', '-v', text, regex); };
rules.hasDir = function(dir) { return this.shelljs._('test', '-d', this.resolve(dir)); };
rules.hasFile = function(file) { return this.shelljs._('test', '-f', this.resolve(file)); };
