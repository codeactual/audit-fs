# audit-shelljs

Audit directory properties/content with [ShellJS](https://github.com/arturadib/shelljs).

* Declare expectations with chaining. Stop at first failure.
* `refute` API for negating any expectation.
* Call any `shelljs` method or use wrappers like `hasFile()`.

[![Build Status](https://travis-ci.org/codeactual/audit-shelljs.png)](https://travis-ci.org/codeactual/audit-shelljs)

## Examples

### Expect: `README.md` exists, no line with `console.log` under `lib/`

```js
var audit = new auditShelljs.create();
audit
  .set('dir', '/path/to/dir'); // Target directory
  .hasFile('README.md')
  .refute.grep('console.log', 'lib/**/*.js');

if (audit.pass()) {
  // Expectations met
} else {
  // Inspect audit.last()
}
```

### Expect: Symlink present/absent

Use [_()](docs/AuditShelljs.md) to run any [ShellJS](http://documentup.com/arturadib/shelljs#command-reference) method.

```js
audit._('test', '-L', 'mySymLink');
audit.refute._('test', '-L', 'mySymLink');
```

### Expect: Custom rule

[assert()](docs/AuditShelljs.md) and [refute()](docs/AuditShelljs.md) receive an [OuterShelljs](https://github.com/codeactual/outer-shelljs/blob/master/docs/OuterShelljs.md) instance, `shelljs`.

```js
audit.assert('should ...', function(shelljs) {
  var result = false;
  // ...
  return result;
});

audit.refute('should ...', function(shelljs) {
  var result = false;
  // ...
  return result;
});
```

## Installation

### [NPM](https://npmjs.org/package/audit-shelljs)

    npm install audit-shelljs

## API

[Documentation](docs/AuditShelljs.md)

## License

  MIT

## Tests

    npm test
