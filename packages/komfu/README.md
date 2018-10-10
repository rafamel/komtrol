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
  init(props, providers) {
    this.name = 'Initial name';
  },
  change(props, providers) {
    return this.send();
  },
  methods: {
    // Methods in the method key are automagically bind to the instance,
    // so we can safely pass then downstream (as we'll do for setName).
    setName(value) {
      this.name = value;
      this.send();
    },
    send() {
      // this.next() merges new props with the latest that came downstream,
      // we can deactivate this behavior via this.next(object, { merge: false })
      return this.next({ name: this.name, setName: this.setName });
    }
  }
};
```

### Pure

Allows you to directly intervene in the props and providers stream.

When inheriting from `PureKomfu`, the lifecycle hooks `init` and `onChange` won't be called, nor will `this.props` and `this.providers` be updated. It will also not make `this.next()` available.

* `stream`: *Function,* taking the incoming stream as a parameter:
  * If present, it **must** return a RxJS observable. Default: `(stream$) => stream$`
  * The incoming stream maps to an array with props and providers (`[props, providers]`); similarly, the returning observable **must** map to those also. Otherwise, all middlewares downstream will he hijacked.

```javascript
const pureMiddleware = {
  options: { pure: true },
  stream(stream$) {
    return stream$.pipe(
      map(([props, providers]) => [{...props, name: 'My name' }, providers])
    );
  }
}
```

Pure middlewares can be used to combine other middlewares, which is in fact what `collection()` does:

```javascript
import { create } from 'komfu';
import { middleware1, middleware2, middleware3 } from './middlewares';

const M1 = create(middleware1);
const M2 = create(middleware2);
const M3 = create(middleware3);

const pureMiddleware = {
  options: { pure: true },
  stream(stream$) {
    this.m1 = new M1(stream$);
    this.m2 = new M2(this.m1.out$);
    this.m3 = new M3(this.m2.out$);
    return this.m3.out$;
  },
  mount() {
    this.m1.mount && this.m1.mount();
    this.m2.mount && this.m2.mount();
    this.m3.mount && this.m3.mount();
  },
  unmount() {
    this.m1.unmount && this.m1.unmount();
    this.m2.unmount && this.m2.unmount();
    this.m3.unmount && this.m3.unmount();
  }
}
```

## Similar projects

These projects were inspirational to the development of `komfu`:

* [`recompose`](https://github.com/acdlite/recompose)
* [`proppy`](https://github.com/fahad19/proppy)
