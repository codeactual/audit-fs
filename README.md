# audit-fs

Audit file/directory properties and content

- Declare expectations with chaining. Stop at first failure.
- [Expectations](docs/AuditFs.md#rules): `exists`, `hasFile`, `hasDir`, `minSize`, `minCount`, `maxCount`, `created`, `modified`.
- `refute` API for negating any expectation.
- Call any `shelljs` method or use wrappers like `hasFile()`.
- Available as a [grunt task](https://github.com/codeactual/grunt-audit-fs).

[![Build Status](https://travis-ci.org/codeactual/audit-fs.png)](https://travis-ci.org/codeactual/audit-fs)

## Examples

### Expect: `README.md` exists, no line with `console.log` under `lib/`

```js
var audit = new auditFs.create();
audit
  .set('dir', '/path/to/dir'); // Target directory
  .hasFile('README.md')
  .refute.grep('console.log', 'lib/**/*.js');

if (audit.pass()) {
  // Expectations met
} else {
  var rule = audit.last();
  console.log(
    'failed because rule %s with args %s returned %s',
    rule.name, JSON.stringify(rule.args), JSON.stringify(rule.res)
  );
}
```

### Expect: Symlink present/absent

Use [_()](docs/AuditFs.md) to run any [ShellJS](http://documentup.com/arturadib/shelljs#command-reference) method.

```js
audit._('test', '-L', 'mySymLink');
audit.refute._('test', '-L', 'mySymLink');
```

### Expect: Custom rule

[assert()](docs/AuditFs.md) and [refute()](docs/AuditFs.md) receive an [OuterShelljs](https://github.com/codeactual/outer-shelljs/blob/master/docs/OuterShelljs.md) instance, `shelljs`.

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

### [NPM](https://npmjs.org/package/audit-fs)

    npm install audit-fs

## API

[Documentation](docs/AuditFs.md)

## License

  MIT

## Tests

    npm test
