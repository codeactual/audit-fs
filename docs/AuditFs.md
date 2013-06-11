Audit file/directory properties and content

_Source: [lib/audit-fs/index.js](../lib/audit-fs/index.js)_

<a name="tableofcontents"></a>

- <a name="toc_exportsauditfs"></a><a name="toc_exports"></a>[exports.AuditFs](#exportsauditfs)
- <a name="toc_exportscreate"></a>[exports.create](#exportscreate)
- <a name="toc_exportsextendauditfsext"></a>[exports.extendAuditFs](#exportsextendauditfsext)
- <a name="toc_exportsextendrulesext"></a>[exports.extendRules](#exportsextendrulesext)
- <a name="toc_auditfs"></a>[AuditFs](#auditfs)
- <a name="toc_auditfsprototypelast"></a><a name="toc_auditfsprototype"></a>[AuditFs.prototype.last](#auditfsprototypelast)
- <a name="toc_auditfsprototypepass"></a>[AuditFs.prototype.pass](#auditfsprototypepass)
- <a name="toc_rules_"></a><a name="toc_rules"></a>[rules._](#rules_)
- <a name="toc_rules__method"></a>[rules.__](#rules__method)
- <a name="toc_rulesassertlabel-cb"></a>[rules.assert](#rulesassertlabel-cb)
- <a name="toc_rulesrefutelabel-cb"></a>[rules.refute](#rulesrefutelabel-cb)
- <a name="toc_rulesgrep"></a>[rules.grep](#rulesgrep)
- <a name="toc_rulesgrepv"></a>[rules.grepv](#rulesgrepv)
- <a name="toc_ruleshasdirdir"></a>[rules.hasDir](#ruleshasdirdir)
- <a name="toc_ruleshasfilefile"></a>[rules.hasFile](#ruleshasfilefile)

<a name="exports"></a>

# exports.AuditFs()

> [AuditFs](#auditfs) constructor.

<sub>Go: [TOC](#tableofcontents) | [exports](#toc_exports)</sub>

# exports.create()

> Create a new [AuditFs](#auditfs).

**Return:**

`{object}`

<sub>Go: [TOC](#tableofcontents) | [exports](#toc_exports)</sub>

# exports.extendAuditFs(ext)

> Extend [AuditFs](#auditfs).prototype.

**Parameters:**

- `{object} ext`

**Return:**

`{object}` Merge result.

<sub>Go: [TOC](#tableofcontents) | [exports](#toc_exports)</sub>

# exports.extendRules(ext)

> Extend audit rule set.

**Parameters:**

- `{object} ext`

**Return:**

`{object}` Merge result.

<sub>Go: [TOC](#tableofcontents) | [exports](#toc_exports)</sub>

# AuditFs()

> AuditFs constructor.

**Usage:**

```js
var dox = require('audit-fs').create();
```

**Configuration:**

- `{string} [input]` Source file to read
- `{string} [output]` Markdown file to write

**Properties:**

- `{object} shelljs` OuterShelljs instance
- `{array} tests` One object per executed test
  - `{string} name` Ex. 'hasFile'
  - `{function} cb` Name-specific test function from `createTester()`
  - `{mixed} res` Ex. ShellJS `test()` boolean result
- `{array} result` One object per executed test
  - `{string} name` Ex. 'hasFile'
  - `{array} args` Ex. arguments passed to `hasFile()`
  - `{mixed} res` Ex. ShellJS `test()` boolean result
- `{boolean} match` True if 0 executed tests failed
- `{function} <rule>` Generated rule testing method
- `{function} refute.<rule>` Negated variants of above rule testing methods

<sub>Go: [TOC](#tableofcontents)</sub>

<a name="auditfsprototype"></a>

# AuditFs.prototype.last()

> Return the result of the last executed test.

**Return:**

`{mixed}` Result object, or undefined if none were executed.

<sub>Go: [TOC](#tableofcontents) | [AuditFs.prototype](#toc_auditfsprototype)</sub>

# AuditFs.prototype.pass()

> Run queued tests and return the result. Stop at first failure.

**Return:**

`{boolean}` True if all tests passed.

<sub>Go: [TOC](#tableofcontents) | [AuditFs.prototype](#toc_auditfsprototype)</sub>

<a name="rules"></a>

# rules._()

> Truthy-test a custom ShellJS invocation.

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.__(method)

> Truthy-test a custom OuterShelljs invocation.

**Parameters:**

- `{string} method` Ex. 'findByRegex', 'grep'

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.assert(label, cb)

> Truthy-test a custom function invocation.

**Parameters:**

- `{string} label` Ex. 'contain debug logging'
- `{function} cb`
  - Receives one argument: OuterShelljs instance.
  - Return value is used as the test result.

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.refute(label, cb)

> Falsey-test a custom function invocation.

**Parameters:**

- `{string} label` Ex. 'contain debug logging'
- `{function} cb`
  - Receives one argument: OuterShelljs instance.
  - Return value is used as the test result.

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.grep()

> Verify that a file has a line with the given string.

Thin wrapper around `OuterShelljs#grep`.

**Return:**

`{boolean}`

**See:**

- [OuterShelljs](https://github.com/codeactual/outer-shelljs/blob/master/docs/OuterShelljs.md)

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.grepv()

> Verify that a file has a line with the given string.

Thin wrapper around `OuterShelljs#grep`.

**Return:**

`{boolean}`

**See:**

- [OuterShelljs](https://github.com/codeactual/outer-shelljs/blob/master/docs/OuterShelljs.md)

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.hasDir(dir)

> Verify that a sub-dir exists.

**Parameters:**

- `{string} dir`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.hasFile(file)

> Verify that a descendant file exists.

**Parameters:**

- `{string} file`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

_&mdash;generated by [apidox](https://github.com/codeactual/apidox)&mdash;_
