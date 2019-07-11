import fu from '~/fu';
import { TFu } from '~/types';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import combineMerge from '~/utils/combine-merge';
import createSetter from '~/utils/create-setter';

export default function withState<A, K extends string, SK extends string, T>(
  key: K,
  setKey: SK,
  initial: T | (() => T)
): TFu<
  A,
  A & { [P in K]: T } & { [P in SK]: (update: T | ((value: T) => T)) => void }
> {
  return fu((instance) => {
    const initialValue = isInitialFn(initial) ? initial() : initial;
    const $value = new BehaviorSubject(initialValue);
    const set = createSetter($value);

    return combineMerge(
      [instance.initial, { [key]: initialValue, [setKey]: set } as any],
      [
        instance.subscriber,
        $value.pipe(map((b) => ({ [key]: b, [setKey]: set } as any)))
      ]
    );
  });
}

export function isInitialFn<T>(initial: T | (() => T)): initial is () => T {
  return typeof initial === 'function';
}
