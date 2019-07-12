import { stateful } from '~/abstracts';
import { TFu } from '~/types';
import { isSelfFn } from '~/utils';

export type TWithState<
  A extends object,
  T,
  K extends string,
  SK extends string
> = A &
  { [P in K]: T } &
  { [P in SK]: (update: T | ((value: T) => T)) => void };

export default function withState<
  A extends object,
  T,
  K extends string,
  SK extends string
>(
  key: K,
  setKey: SK,
  initial: T | ((self: A) => T)
): TFu<A, TWithState<A, T, K, SK>> {
  return stateful(
    isSelfFn(initial) ? (self) => initial(self) : initial,
    (state) => ({
      map: (a: A, b: T) =>
        ({ ...a, [key]: b, [setKey]: state.set } as TWithState<A, T, K, SK>)
    })
  );
}
