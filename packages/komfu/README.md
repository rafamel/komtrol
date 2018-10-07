# komfu

[![Version](https://img.shields.io/github/package-json/v/rafamel/komfu.svg)](https://github.com/rafamel/komfu)
[![Build Status](https://travis-ci.org/rafamel/komfu.svg)](https://travis-ci.org/rafamel/komfu)
[![Coverage](https://img.shields.io/coveralls/rafamel/komfu.svg)](https://coveralls.io/github/rafamel/komfu)
[![Dependencies](https://david-dm.org/rafamel/komfu/status.svg)](https://david-dm.org/rafamel/komfu)
[![Vulnerabilities](https://snyk.io/test/npm/komfu/badge.svg)](https://snyk.io/test/npm/komfu)
[![Issues](https://img.shields.io/github/issues/rafamel/komfu.svg)](https://github.com/rafamel/komfu/issues)
[![License](https://img.shields.io/github/license/rafamel/komfu.svg)](https://github.com/rafamel/komfu/blob/master/LICENSE)

<!-- markdownlint-disable MD036 -->
**Reactive component props composition.**
<!-- markdownlint-enable MD036 -->

## Install

[`npm install komfu`](https://www.npmjs.com/package/komfu)

## TODO

* Names: rekom, rekon, komfu, kompi
* Update BOILERPLATE

## Middlewares

### Definition

`komfu` middlewares are simple objects defining a specific set of **optional** hooks:

### Lifecycle

TODO

### Usage

Inside a middleware method, you have access to `this.next()`

* `this.props`
* `this.providers`
* `this.next`

#### `this.next(props, options?): Promise<void>`

TODO

### Example

```javascript
// This middleware will add the props 'name' and 'setName' to the incoming
// stream of props. When 'setName' is called, it will send the new name
// down the stream.
const myMiddleware = {
  // Middleware-specific
  name: 'Initial name',
  setName(value) {
    // Functions are automatically bind to the instance
    // so they can be passed downstream
    this.name = value;
    this.doNext();
  },
  doNext() {
    return this.next(
      { name: this.name, setName: this.setName },
      { merge: true }
    );
  },
  // Lifecycle
  change(props, providers) {
    return this.doNext();
  }
};
```

### *"I know what I'm doing"*

You can also override `komfu` middleware logic and directly intervene in the props and providers stream. Middlewares can also have properties:

* `options`: *Object,* with optional properties:
  * `pure`: *Boolean,* when `true`, `komfu` will not call either the `init` nor the `change` method, it will not update `this.props` and `this.providers` for instances of the middleware, and it will also not make `this.next()` available, for those cases in which you are only manipulating the stream. Default: `false`.
* `stream`: *Function,* taking the incoming stream as a parameter:
  * If present, it **must** return a RxJS observable. Default: `(stream$) => stream$`
  * The incoming stream maps to an array with props and providers (`[props, providers]`); similarly, the returning observable **must** map to those also. Otherwise, all middlewares downstream will he hijacked.

```javascript
const myMiddleware = {
  options: { pure: true },
  stream(stream$) {
    return stream$.pipe(
      map(([props, providers]) => [{...props, name: 'My name' }, providers])
    );
  }
};
```

## Similar projects

These projects were inspirational to the development of `komfu`:

* [`recompose`](https://github.com/acdlite/recompose)
* [`proppy`](https://github.com/fahad19/proppy)
