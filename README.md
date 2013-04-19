# audit-shelljs

Audit directory properties/content with ShellJS.

* Declare expectations with chaining. Stop at first failure.
* Use any ShellJS method.
* Convenience wrappers.

[![Build Status](https://travis-ci.org/codeactual/audit-shelljs.png)](https://travis-ci.org/codeactual/audit-shelljs)

## Example

```js
var audit = new auditShelljs.create();
audit
  .set('dir', '/path/to/dir'); // Target directory
  .hasFile('README.md')
  .grepv('console.log', 'lib/*.js');

if (audit.pass()) {
  // Expectations met
} else {
  // Inspect audit.last()
}
```

## Installation

### [NPM](https://npmjs.org/package/audit-shelljs)

    npm install audit-shelljs

## Main API

### create()

> Return a new AuditShelljs() instance.

### extendAuditShelljs(ext)

> Extend AuditShelljs.prototype.

### extendRules(ext)

> Extend rule (ex. 'hasFile') method set.

### last()

> Return the result of the last executed test.

Object properties:

* `{string} name` Ex. 'hasFile'
* `{array} args` Ex. arguments passed to hasFile()
* `{mixed} res` Ex. ShellJS test() boolean result

### pass()

> Run queued tests and return the result. Stop at first failure.

## Configuration API

### .set(key, val) / .get(key)

* `{string} dir` Audit's target directory. No trailing slash.
 * default: `process.cwd()`

## Rules

Expectations can be chained.

### ._(method, args*)

> Truthy-test the result of any ShellJS method.

* Test function receives one argument: [OuterShelljs](https://github.com/codeactual/outer-shelljs) instance.

### .grep(text, regex)

> `shelljs.grep()` wrapper.

### .grepv(text, regex)

> `shelljs.grep('v', ...)` wrapper.

### .hasFile(file)

> `shelljs.test('-f', ...)` wrapper.

* `file` must be relative to the target directory. No leading dot or slash.

### .hasDir(dir)

> `shelljs.test('-d', ...)` wrapper.

* `file` must be relative to the target directory. No leading dot or slash.

### .assert(cb)

> Truthy-test the result of a custom test function.

* Test function receives one argument: [OuterShelljs](https://github.com/codeactual/outer-shelljs) instance.

### .refute(cb)

> Falsey-test the result of a custom test function.

## License

  MIT

## Tests

    npm test
