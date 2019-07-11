import fu from '~/fu';
import { TFu } from '~/types';
import { BehaviorSubject } from 'rxjs';
import combineMerge from '~/utils/combine-merge';
import createSetter from '~/utils/create-setter';

export type TWithState<A, T, K extends string, SK extends string> = A &
  { [P in K]: T } &
  { [P in SK]: (update: T | ((value: T) => T)) => void };

export default function withState<A, T, K extends string, SK extends string>(
  key: K,
  setKey: SK,
  initial: T | (() => T)
): TFu<A, TWithState<A, T, K, SK>> {
  return fu((instance) => {
    const initialValue = isInitialFn(initial) ? initial() : initial;
    const $value = new BehaviorSubject(initialValue);
    const set = createSetter($value);

    return combineMerge(
      [instance.initial, initialValue],
      [instance.subscriber, $value],
      (a: A, b: T) =>
        ({ ...a, [key]: b, [setKey]: set } as TWithState<A, T, K, SK>)
    );
  });
}

export function isInitialFn<T>(initial: T | (() => T)): initial is () => T {
  return typeof initial === 'function';
}
