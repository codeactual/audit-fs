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
  .refute.grep('console.log', 'lib/**/*.js');

if (audit.pass()) {
  // Expectations met
} else {
  // Inspect audit.last()
}
```

## Installation

### [NPM](https://npmjs.org/package/audit-shelljs)

    npm install audit-shelljs

## API Documentation

[AuditShelljs](docs/AuditShelljs.md)

## License

  MIT

## Tests

    npm test
