import {
  key,
  memo,
  pipe,
  TFu,
  TFn,
  TUpdatePolicy,
  stateful,
  createCache
} from 'komfu';
import { toStream } from 'mobx-utils';

export default withMobx;

/* Declarations */
function withMobx<A extends object, B extends object | void, T extends object>(
  compute: TFn<A, B, T>
): TFu<A, B, T>;
function withMobx<A extends object, B extends object | void, T extends object>(
  policy: TUpdatePolicy<A, B>,
  compute: TFn<A, B, T>
): TFu<A, B, T>;
function withMobx<
  A extends object,
  B extends object | void,
  T,
  K extends string
>(key: K, compute: TFn<A, B, T>): TFu<A, B, { [P in K]: T }>;
function withMobx<
  A extends object,
  B extends object | void,
  T,
  K extends string
>(
  key: K,
  policy: TUpdatePolicy<A, B>,
  compute: TFn<A, B, T>
): TFu<A, B, { [P in K]: T }>;

/* Implementation */
function withMobx(a: any, b?: any, c?: any): any {
  if (typeof a === 'string') {
    return c === undefined
      ? pipe.f(trunk(b), key(a), memo(false))
      : pipe.f(trunk(c), key(a), memo(b));
  } else {
    return b === undefined
      ? pipe.f(trunk(a), memo(false))
      : pipe.f(trunk(b), memo(a));
  }
}

export function trunk<A extends object, B extends object | void, T>(
  compute: TFn<A, B, T>
): TFu<A, B, T> {
  return stateful((collect, emit) => {
    const cache = createCache(compute(collect(), collect));
    const stream = toStream(() => compute(collect(), collect));

    const subscription = stream.subscribe((value) => {
      cache.set(value);
      emit();
    });

    return {
      execute: (self, signal) => {
        if (signal === 'next') cache.set(compute(self, collect));
        return cache.collect();
      },
      teardown: () => subscription.unsubscribe()
    };
  });
}
