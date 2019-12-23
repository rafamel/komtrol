# komfu

[![Version](https://img.shields.io/npm/v/komfu.svg)](https://www.npmjs.com/package/komfu)
[![Build Status](https://img.shields.io/travis/rafamel/komfu/master.svg)](https://travis-ci.org/rafamel/komfu)
[![Coverage](https://img.shields.io/coveralls/rafamel/komfu/master.svg)](https://coveralls.io/github/rafamel/komfu)
[![Dependencies](https://img.shields.io/david/rafamel/komfu.svg?path=packages%2Fkomfu)](https://david-dm.org/rafamel/komfu.svg?path=packages%2Fkomfu)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/komfu.svg)](https://snyk.io/test/npm/komfu)
[![License](https://img.shields.io/github/license/rafamel/komfu.svg)](https://github.com/rafamel/komfu/blob/master/LICENSE)
[![Types](https://img.shields.io/npm/types/komfu.svg)](https://www.npmjs.com/package/komfu)

> Reactive state and lifecycle pipelines for functional components

If you find it useful, consider [starring the project](https://github.com/rafamel/komfu/tree/master/packages/core) 💪 and/or following [its author](https://github.com/rafamel) ❤️ -there's more on the way!

## Install

[`npm install komfu`](https://www.npmjs.com/package/komfu)

## Usage

### Basic concepts

<!-- TODO -->

### Providers

Providers generally provide a property or set of properties to the object coming down the stream, or react in some way to its changes.

As part of the provider contract:

* They *never* mutate the incoming object on a stream -`self`-, but instead return a new object merged with the additional properties, if any.
* They cannot access values of providers further down the stream, but can react to and use values yielded by those before them.

Also, as conventions in terms of the design of providers' apis:

* Providers taking a `key` to define their output value at do so as a first parameter. Those that can also take no `key` at all as they output an object to be merged with the incoming `self` will have several signatures, both with `key` as a first param and without it.
* Providers taking functions that receive `self` will do so only for initialization, meaning `self` won't be further updated, unless they also take an update policy -`TUpdatePolicy`- determining when to re-run the callback with the updated `self` value. There are a couple *exceptions:*
  * [`connect`:](#connect) The `connect` [*mount*](#mounts) is designed specifically to get around this. It will take a function to be called on initialization that will receive `self` as a parameter, and should return a provider. In this case, the `self` object will be assigned its new values as they come, but the callback won't be re-run. This is intended for cases in which access to its latest values is required, but a reaction to them is not.
  * `withAction`, which is simply a shorthand for a `connect`ed `withFields`, as there are reasonable and common use cases for this -the most notable being defining methods, which won't need to be redefined on incoming changes, but might need access to the latest `self` values when run.

<!-- TODO -->

### Lifecycle

<!-- TODO -->

#### Initialization

<!-- TODO -->

#### Update

<!-- TODO -->

#### Teardown

<!-- TODO -->

### Mounts

Mounts take a provider returning function, to be run on [initialization](#initialization). You can take advantage of the closure here and access the parent's initial state with the simplest no-overhead mount -[`lift`](#lift)-, or access the parent's updated values with [`connect`](#connect).

#### `lift`

Mount allowing access to the initial state of its parent. As it expects a provider returning function, it can also be used to perform operations on initialization and taking advantage of this closure.

#### `connect`

Mount that assigns all incoming values from its parent to `self`. It will, however, not rerun the initialization function. To be used when we need access to updated values, without reacting to them.

### Abstract providers

Abstract providers offer the least level of abstraction for custom provider creation. From least to most abstracted, they are:

#### `fu`

Abstract provider with the lowest level of abstraction. It allows unrestricted acces to the parent instance, taken as a first argument to the `initialize` function.

If no `initial`, `subscriber`, or `teardown` are returned by the `initialize` factory, it will inherit those of the parent. If `teardown` is passed, it will wrap it to also call the parent's.

#### `extend`

Abstract provider only allowing access from the factory function `initialize` to the parent's initial state (`self`).

It expects an initial state, a subscriber, and a map function to map the intial state value and subscriber emitted values to the pipeline object.

#### `stateful`

Abstract provider for easy creation of state dependent providers. It only allows access to the initial state (`self`) of the parent's instance.
