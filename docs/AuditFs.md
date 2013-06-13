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
- <a name="toc_rulesexistsname"></a>[rules.exists](#rulesexistsname)
- <a name="toc_ruleshasdirdir"></a>[rules.hasDir](#ruleshasdirdir)
- <a name="toc_ruleshasfilefile"></a>[rules.hasFile](#ruleshasfilefile)
- <a name="toc_rulesminsizename-bytes"></a>[rules.minSize](#rulesminsizename-bytes)
- <a name="toc_rulesmaxsizename-bytes"></a>[rules.maxSize](#rulesmaxsizename-bytes)
- <a name="toc_rulesmincountname-count"></a>[rules.minCount](#rulesmincountname-count)
- <a name="toc_rulesmaxcountname-count"></a>[rules.maxCount](#rulesmaxcountname-count)
- <a name="toc_rulescreatedname-max"></a>[rules.created](#rulescreatedname-max)
- <a name="toc_rulesmodifiedname-max"></a>[rules.modified](#rulesmodifiedname-max)

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
var auditFs = require('audit-fs').create();
```

**Configuration:**

- `{string} [dir=cwd]` Parent directory to examine

**Properties:**

- `{object} shelljs` OuterShelljs instance
- `{array} tests` One object per executed test
 @param {string} name Ex. 'hasFile'
  - `{function} cb` Name-specific test function from `createTester()`
  - `{mixed} res` Ex. ShellJS `test()` boolean result
- `{array} result` One object per executed test
 @param {string} name Ex. 'hasFile'
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

**Usage:**

```js
auditFs._('test', '-L', '/path/to/symlink');
```

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.__(method)

> Truthy-test a custom OuterShelljs invocation.

**Usage:**

```js
auditFs.__('findByRegex', '/path/to/dir', /\.js$/);
```

**Parameters:**

- `{string} method` Ex. 'findByRegex', 'grep'

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.assert(label, cb)

> Truthy-test a custom function invocation.

**Usage:**

```js
auditFs.assert('should ...', function(shelljs) {
  var passed = false;
  // ...
  return passed;
});
```

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

**Usage:**

```js
auditFs.refute('should ...', function(shelljs) {
  var passed = false;
  // ...
  return passed;
});
```

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

**Usage:**

```js
auditFs.grep('needle', '/path/to/haystack');
```

**Return:**

`{boolean}`

**See:**

- [OuterShelljs](https://github.com/codeactual/outer-shelljs/blob/master/docs/OuterShelljs.md)

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.grepv()

> Verify that a file does not have a line with the given string.

Thin wrapper around `OuterShelljs#grepv`.

**Usage:**

```js
auditFs.grepv('needle', '/path/to/haystack');
```

**Return:**

`{boolean}`

**See:**

- [OuterShelljs](https://github.com/codeactual/outer-shelljs/blob/master/docs/OuterShelljs.md)

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.exists(name)

> Verify that a descendant file/dir exists.

**Usage:**

```js
auditFs.exists('rel/path/to/file');
auditFs.exists('rel/path/to/dir');
```

**Parameters:**

- `{string} name`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.hasDir(dir)

> Verify that a sub-dir exists.

**Usage:**

```js
auditFs.hasDir('rel/path/to/dir');
```

**Parameters:**

- `{string} dir`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.hasFile(file)

> Verify that a descendant file exists.

**Usage:**

```js
auditFs.hasFile('rel/path/to/file');
```

**Parameters:**

- `{string} file`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.minSize(name, bytes)

> Verify that a file/dir size is not below a minimum.

**Usage:**

```js
auditFs.minSize('rel/path/to/file', 400);
auditFs.minSize('rel/path/to/dir', 400);
```

**Parameters:**

- `{string} name`
- `{number} bytes`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.maxSize(name, bytes)

> Verify that a file/dir size is not above a maximum.

**Usage:**

```js
auditFs.maxSize('rel/path/to/file', 400);
auditFs.maxSize('rel/path/to/dir', 400);
```

**Parameters:**

- `{string} name`
- `{number} bytes`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.minCount(name, count)

> Verify that a dir has a minimum (non-recursive) file count.

**Usage:**

```js
auditFs.minCount('rel/path/to/dir', 3);
```

**Parameters:**

- `{string} name`
- `{number} count`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.maxCount(name, count)

> Verify that a dir has a maximum (non-recursive) file count.

**Usage:**

```js
auditFs.maxCount('rel/path/to/dir', 3);
```

**Parameters:**

- `{string} name`
- `{number} count`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.created(name, max)

> Verify that file/dir was created in the last N seconds.

**Usage:**

```js
auditFs.created('rel/path/to/file', 3600);
auditFs.created('rel/path/to/dir', 3600);
```

**Parameters:**

- `{string} name`
- `{number} max` Max age, in seconds, to be considered new

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

# rules.modified(name, max)

> Verify that file/dir was modified in the last N seconds.

**Usage:**

```js
auditFs.modified('rel/path/to/file', 3600);
auditFs.modified('rel/path/to/dir', 3600);
```

**Parameters:**

- `{string} name`
- `{number} max` Max age, in seconds, to be considered new

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [rules](#toc_rules)</sub>

_&mdash;generated by [apidox](https://github.com/codeactual/apidox)&mdash;_
