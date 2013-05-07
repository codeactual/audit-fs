/**
 * Audit directory properties/content with ShellJS
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
'use strict';

var rules = {};

/**
 * AuditShelljs constructor.
 */
exports.AuditShelljs = AuditShelljs;

/**
 * Create a new AuditShelljs.
 *
 * @return {object}
 */
exports.create = function() { return new AuditShelljs(); };

/**
 * Extend AuditShelljs.prototype.
 *
 * @param {object} ext
 * @return {object} Merge result.
 */
exports.extendAuditShelljs = function(ext) { extend(AuditShelljs.prototype, ext); };

/**
 * Extend audit rule set.
 *
 * @param {object} ext
 * @return {object} Merge result.
 */
exports.extendRules = function(ext) { extend(rules, ext); };

/**
 * Functions that each test an audit rule, ex. has a specific file.
 *
 * @api private
 */
exports.rules = rules;

var requireComponent = require('../component/require');
var extend = requireComponent('extend');
var configurable = requireComponent('configurable.js');

/**
 * AuditShelljs constructor.
 *
 * Usage:
 *
 *     var dox = require('audit-shelljs').create();
 *
 * Configuration:
 *
 * - `{string} [input]` Source file to read
 * - `{string} [output]` Markdown file to write
 *
 * Properties:
 *
 * - `{object} shelljs` OuterShelljs instance
 * - `{array} tests` One object per executed test
 *   - `{string} name` Ex. 'hasFile'
 *   - `{function} cb` Name-specific test function from `createTester()`
 *   - `{mixed} res` Ex. ShellJS `test()` boolean result
 * - `{array} result` One object per executed test
 *   - `{string} name` Ex. 'hasFile'
 *   - `{array} args` Ex. arguments passed to `hasFile()`
 *   - `{mixed} res` Ex. ShellJS `test()` boolean result
 * - `{boolean} match` True if 0 executed tests failed
 * - `{function} <rule>` Generated rule testing method
 * - `{function} refute.<rule>` Negated variants of above rule testing methods
 */
function AuditShelljs() {
  var self = this;

  this.settings = {
    dir: process.cwd()
  };

  this.shelljs = require('outer-shelljs').create();
  this.tests = [];
  this.results = [];
  this.match = true;

  var AS = AuditShelljs;

  // Augment method set manually rather than w/ prototype because
  // rule set may have been extended.
  Object.keys(rules).forEach(function(name) {
    self[name] = AS.createQueuePush(name, AS.createTester(name));
  });

  Object.keys(rules).forEach(function(name) {
    if (name === 'assert' || name === 'refute') { return; }
    self.refute[name] = AS.createQueuePush(name, AS.createTester(name, true)).bind(self);
  });
}

/**
 * Wrap execution of a test function, like hasFile(), so we can define common
 * before/after operations like tracking results, avoiding unnecessary tests, etc.
 *
 * @param {string} name Ex. 'hasFile'
 * @param {boolean} [negated=false] Expect the check the fail.
 * @return {function} Expects the same arguments as the named test.
 * @api private
 */
AuditShelljs.createTester = function(name, negated) {
  return function() {
    if (!this.match) { return; } // Prior test already failed the audit
    var res = rules[name].apply(this, arguments);
    this.results.push({name: name, args: arguments, res: res});
    this.match = this.match && (negated ? !res : res);
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
 * @api private
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
 * @api private
 */
AuditShelljs.prototype.resolve = function(relPath) {
  return this.get('dir') + '/' + relPath;
};

/**
 * Truthy-test a custom ShellJS invocation.
 *
 * @return {boolean}
 */
rules._ = function() {
  return !!this.shelljs._.apply(this.shelljs, arguments);
};

/**
 * Truthy-test a custom OuterShelljs invocation.
 *
 * @param {string} method Ex. 'findByRegex', 'grep'
 * @return {boolean}
 */
rules.__ = function(method) {
  return !!this.shelljs[method].apply(this.shelljs, [].slice.call(arguments, 1));
};

/**
 * Truthy-test a custom function invocation.
 *
 * @param {string} label Ex. 'contain debug logging'
 * @param {function} cb
 * - Receives one argument: OuterShelljs instance.
 * - Return value is used as the test result.
 * @return {boolean}
 */
rules.assert = function(label, cb) { return !!cb(this.shelljs); };

/**
 * Falsey-test a custom function invocation.
 *
 * @param {string} label Ex. 'contain debug logging'
 * @param {function} cb
 * - Receives one argument: OuterShelljs instance.
 * - Return value is used as the test result.
 * @return {boolean}
 */
rules.refute = function(label, cb) { return !cb(this.shelljs); };

/**
 * Verify that a file has a line with the given string.
 *
 * Thin wrapper around `OuterShelljs#grep`.
 *
 * @see OuterShelljs https://github.com/codeactual/outer-shelljs/blob/master/docs/OuterShelljs.md
 * @return {boolean}
 */
rules.grep = function() {
  var res = this.shelljs.grep.apply(this.shelljs, arguments);
  return !!(res.code > 2 || res.length);
};

/**
 * Verify that a file has a line with the given string.
 *
 * Thin wrapper around `OuterShelljs#grep`.
 *
 * @see OuterShelljs https://github.com/codeactual/outer-shelljs/blob/master/docs/OuterShelljs.md
 * @return {boolean}
 */
rules.grepv = function() {
  var args = [].slice.call(arguments);
  if (args[0][0] === '-') {
    args[0] += 'v';
  } else {
    args.unshift('-v');
  }
  var res = this.shelljs.grep.apply(this.shelljs, args);
  return !!(res.code > 2 || res.length);
};

/**
 * Verify that a sub-dir exists.
 *
 * @param {string} dir
 * @return {boolean}
 */
rules.hasDir = function(dir) { return this.shelljs._('test', '-d', this.resolve(dir)); };

/**
 * Verify that a descendant file exists.
 *
 * @param {string} file
 * @return {boolean}
 */
rules.hasFile = function(file) { return this.shelljs._('test', '-f', this.resolve(file)); };
