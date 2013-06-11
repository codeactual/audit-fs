/**
 * Audit file/directory properties and content
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
'use strict';

var rules = {};

/**
 * AuditFs constructor.
 */
exports.AuditFs = AuditFs;

/**
 * Create a new AuditFs.
 *
 * @return {object}
 */
exports.create = function() { return new AuditFs(); };

/**
 * Extend AuditFs.prototype.
 *
 * @param {object} ext
 * @return {object} Merge result.
 */
exports.extendAuditFs = function(ext) { extend(AuditFs.prototype, ext); };

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

var fs = require('fs');
var path = require('path');

/**
 * AuditFs constructor.
 *
 * Usage:
 *
 *     var auditFs = require('audit-fs').create();
 *
 * Configuration:
 *
 * - `{string} [dir=cwd]` Parent directory to examine
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
function AuditFs() {
  var self = this;

  this.settings = {
    dir: process.cwd()
  };

  this.shelljs = require('outer-shelljs').create();
  this.tests = [];
  this.results = [];
  this.match = true;

  var AS = AuditFs;

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
AuditFs.createTester = function(name, negated) {
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
 *   Returns a reference to the current AuditFs instance.
 * @api private
 */
AuditFs.createQueuePush = function(name, cb) {
  return function() {
    this.tests.push({name: name, cb: cb, args: [].slice.call(arguments)});
    return this;
  };
};

/**
 * Get a file/directory's total disk space use.
 *
 * @author http://stackoverflow.com/a/7550430
 * @param {string} name
 * @return {number} total
 * @api private
 */
AuditFs.getFileSize = function(name) {
  var stats = fs.lstatSync(name);
  var total = stats.size;
  if (stats.isDirectory()) {
    var readdir = fs.readdirSync(name);
    readdir.forEach(function(child) {
      total += AuditFs.getFileSize(path.join(name, child));
    });
  }
  return total;
};

/**
 * Get a directory's (non-recursive) file count.
 *
 * @param {string} dir
 * @return {number}
 * @api private
 */
AuditFs.getFileCount = function(dir) {
  var total = 0;
  var readdir = fs.readdirSync(dir);
  readdir.forEach(function(child) {
    var stats = fs.lstatSync(path.join(dir, child));
    if (!stats.isDirectory()) { total++; }
  });
  return total;
};

configurable(AuditFs.prototype);

/**
 * Return the result of the last executed test.
 *
 * @return {mixed} Result object, or undefined if none were executed.
 */
AuditFs.prototype.last = function() {
  return this.results[this.results.length - 1];
};

/**
 * Run queued tests and return the result. Stop at first failure.
 *
 * @return {boolean} True if all tests passed.
 */
AuditFs.prototype.pass = function() {
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
AuditFs.prototype.resolve = function(relPath) {
  return this.get('dir') + '/' + relPath;
};

/**
 * Truthy-test a custom ShellJS invocation.
 *
 * Usage:
 *
 *     auditFs._('test', '-L', '/path/to/symlink');
 *
 * @return {boolean}
 */
rules._ = function() {
  return !!this.shelljs._.apply(this.shelljs, arguments);
};

/**
 * Truthy-test a custom OuterShelljs invocation.
 *
 * Usage:
 *
 *     auditFs.__('findByRegex', '/path/to/dir', /\.js$/);
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
 * Usage:
 *
 *     auditFs.assert('should ...', function(shelljs) {
 *       var passed = false;
 *       // ...
 *       return passed;
 *     });
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
 * Usage:
 *
 *     auditFs.refute('should ...', function(shelljs) {
 *       var passed = false;
 *       // ...
 *       return passed;
 *     });
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
 * Usage:
 *
 *     auditFs.grep('needle', '/path/to/haystack');
 *
 * @see OuterShelljs https://github.com/codeactual/outer-shelljs/blob/master/docs/OuterShelljs.md
 * @return {boolean}
 */
rules.grep = function() {
  var res = this.shelljs.grep.apply(this.shelljs, arguments);
  return !!(res.code > 2 || res.length);
};

/**
 * Verify that a file does not have a line with the given string.
 *
 * Thin wrapper around `OuterShelljs#grepv`.
 *
 * Usage:
 *
 *     auditFs.grepv('needle', '/path/to/haystack');
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
 * Verify that a descendant file/dir exists.
 *
 * Usage:
 *
 *     auditFs.exists('rel/path/to/file');
 *     auditFs.exists('rel/path/to/dir');
 *
 * @param {string} name
 * @return {boolean}
 */
rules.exists = function(name) { return this.shelljs._('test', '-e', this.resolve(name)); };

/**
 * Verify that a sub-dir exists.
 *
 * Usage:
 *
 *     auditFs.hasDir('rel/path/to/dir');
 *
 * @param {string} dir
 * @return {boolean}
 */
rules.hasDir = function(dir) { return this.shelljs._('test', '-d', this.resolve(dir)); };

/**
 * Verify that a descendant file exists.
 *
 * Usage:
 *
 *     auditFs.hasFile('rel/path/to/file');
 *
 * @param {string} file
 * @return {boolean}
 */
rules.hasFile = function(file) { return this.shelljs._('test', '-f', this.resolve(file)); };
/**
 * Verify that a file/dir size is not below a minimum.
 *
 * Usage:
 *
 *     auditFs.minSize({filename: 'rel/path/to/file', size: 400});
 *     auditFs.minSize({filename: 'rel/path/to/dir', size: 400});
 *
 * @param {object} config
 *  - `{string} filename`
 *  - `{number} size` Bytes
 * @return {boolean}
 */
rules.minSize = function(config) {
  return AuditFs.getFileSize(config.filename) >= config.size;
};

/**
 * Verify that a file/dir size is not above a maximum.
 *
 * Usage:
 *
 *     auditFs.maxSize({filename: 'rel/path/to/file', size: 400});
 *     auditFs.maxSize({filename: 'rel/path/to/dir', size: 400});
 *
 * @param {object} config
 *  - `{string} filename`
 *  - `{number} size` Bytes
 * @return {boolean}
 */
rules.maxSize = function(config) {
  return AuditFs.getFileSize(config.filename) <= config.size;
};

/**
 * Verify that a dir has a minimum (non-recursive) file count.
 *
 * Usage:
 *
 *     auditFs.minCount({filename: 'rel/path/to/dir', count: 3});
 *
 * @param {object} config
 *  - `{string} filename`
 *  - `{number} size` Bytes
 * @return {boolean}
 */
rules.minCount = function(config) {
  return AuditFs.getFileCount(config.filename) >= config.count;
};

/**
 * Verify that a dir has a maximum (non-recursive) file count.
 *
 * Usage:
 *
 *     auditFs.maxCount({filename: 'rel/path/to/dir', count: 3});
 *
 * @param {object} config
 *  - `{string} filename`
 *  - `{number} size` Bytes
 * @return {boolean}
 */
rules.maxCount = function(config) {
  return AuditFs.getFileCount(config.filename) <= config.count;
};

/**
 * Verify that file/dir was created in the last N seconds.
 *
 * Usage:
 *
 *     auditFs.created({filename: 'rel/path/to/file', max: 3600});
 *     auditFs.created({filename: 'rel/path/to/dir', max: 3600});
 *
 * @param {object} config
 *  - `{string} filename`
 *  - `{number} max` Max age, in seconds, to be considered new
 * @return {boolean}
 */
rules.created = function(config) {
  var stats = fs.lstatSync(config.filename);
  return (Date.now() - stats.ctime.valueOf()) <= config.max;
};

/**
 * Verify that file/dir was modified in the last N seconds.
 *
 * Usage:
 *
 *     auditFs.modified({filename: 'rel/path/to/file', max: 3600});
 *     auditFs.modified({filename: 'rel/path/to/dir', max: 3600});
 *
 * @param {object} config
 *  - `{string} filename`
 *  - `{number} max` Max age, in seconds, to be considered new
 * @return {boolean}
 */
rules.modified = function(config) {
  var stats = fs.lstatSync(config.filename);
  return (Date.now() - stats.mtime.valueOf()) <= config.max;
};
