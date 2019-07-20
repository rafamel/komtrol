import { TFu, TFn } from '~/types';
import { stateful } from '~/abstracts';
import pipe from '~/pipe';
import { createCache, isFn } from '~/utils';
import { map } from '~/transforms';

type TSetState<T> = (update: Partial<T> | ((value: T) => Partial<T>)) => void;

export default withState;

/* Declarations */
function withState<A extends object, B extends object | void, T extends object>(
  initial: T | TFn<A, B, T>
): TFu<A, B, T & { setState: TSetState<T> }>;
function withState<
  A extends object,
  B extends object | void,
  T,
  K extends string
>(
  key: K,
  initial: T | TFn<A, B, T>
): TFu<A, B, { [P in K]: T } & { setState: TSetState<T> }>;
function withState<
  A extends object,
  B extends object | void,
  T,
  K extends string,
  S extends string
>(
  key: K,
  setKey: S,
  initial: T | TFn<A, B, T>
): TFu<A, B, { [P in K]: T } & { [P in S]: TSetState<T> }>;

/* Implementation */
function withState(a: any, b?: any, c?: any): any {
  if (typeof a === 'string') {
    return c === undefined
      ? pipe.f(
          trunk(b),
          map((self) => ({ [a]: self.state, setState: self.setState }))
        )
      : pipe.f(
          trunk(c),
          map((self) => ({ [a]: self.state, [b]: self.setState }))
        );
  } else {
    return pipe.f(
      trunk(a),
      map((self) => ({ ...self.state, setState: self.setState }))
    );
  }
}

export function trunk<A extends object, B extends object | void, T>(
  initial: TFn<A, B, T>
): TFu<A, B, { state: T; setState: TSetState<T> }> {
  return stateful((collect, emit) => {
    const cache = createCache(
      isFn(initial) ? initial(collect(), collect) : initial
    );

    const setState: TSetState<T> = function setState(update) {
      const current = cache.collect();
      const value =
        typeof update === 'function'
          ? (update as ((value: T) => T))(current)
          : update;
      cache.set(
        typeof value === 'object' && value !== null
          ? { ...current, ...value }
          : value
      );
      emit();
    };

    return {
      execute: () => ({ state: cache.collect(), setState })
    };
  });
}
