import { useMemo } from 'react';
import { SourceSubject, Source } from '../super';
import { NonDefinedUnion } from '../types';
import { into } from 'pipettes';

export type ValueFn<T, P = void> = (
  props: P extends NonDefinedUnion ? undefined : Source<P>
) => T;

export function useValue<T>(value: ValueFn<T>): T;
export function useValue<T, P = void>(props: P, value: ValueFn<T, P>): T;

/**
 * Returns the memoized result of the `value` function,
 * optionally passing `props` as a `Source`.
 */
export function useValue<T, P = void>(a: P | ValueFn<T>, b?: ValueFn<T, P>): T {
  return into(
    (): [P, ValueFn<T, P>] => {
      return b ? [a, b] : ([undefined, a] as any);
    },
    (params) => {
      const [props, valueFn] = params();
      const subject = useMemo(
        () => (props === undefined ? undefined : new SourceSubject(props)),
        []
      );

      if (subject) subject.next(props);
      return useMemo(() => valueFn(subject as any), []);
    }
  );
}
