import { TFu, TFn } from '~/types';
import { stateful } from '~/abstracts';
import pipe from '~/pipe';
import { key } from '~/transforms';
import { Observable } from 'rxjs';
import { createCache, isFn } from '~/utils';

export default withObservable;

/* Declarations */
function withObservable<
  A extends object,
  B extends object | void,
  T extends object
>(
  initial: T | TFn<A, B, T>,
  observable: Observable<T> | TFn<A, B, Observable<T>>
): TFu<A, B, T>;
function withObservable<
  A extends object,
  B extends object | void,
  T,
  K extends string
>(
  key: K,
  initial: T | TFn<A, B, T>,
  observable: Observable<T> | TFn<A, B, Observable<T>>
): TFu<A, B, { [P in K]: T }>;

/* Implementation */
function withObservable(a: any, b: any, c?: any): any {
  return typeof a === 'string' ? pipe.f(trunk(b, c), key(a)) : trunk(a, b);
}

export function trunk<A extends object, B extends object | void, T>(
  initial: T | TFn<A, B, T>,
  observable: Observable<T> | TFn<A, B, Observable<T>>
): TFu<A, B, T> {
  return stateful((collect, emit) => {
    const value = isFn(initial) ? initial(collect(), collect) : initial;
    const subscriber = isFn(observable)
      ? observable(collect(), collect)
      : observable;

    const cache = createCache(value);
    const subscription = subscriber.subscribe((value) => {
      cache.set(value);
      emit();
    });
    return {
      execute: () => cache.collect(),
      teardown: () => subscription.unsubscribe()
    };
  });
}
