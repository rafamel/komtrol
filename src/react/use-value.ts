import { useMemo } from 'react';
import { SourceSubject, Source } from '../super';
import { EmptyUnion } from '../types';
import { pipeInto as into } from 'ts-functional-pipe';

export type ValueFn<T, D = undefined> = (
  deps: D extends EmptyUnion ? undefined : Source<D>
) => T;

export function useValue<T>(value: ValueFn<T>): T;
export function useValue<T, D>(deps: D, value: ValueFn<T, D>): T;

/**
 * Returns the memoized result of the `value` function,
 * optionally passing dependencies as a `Source`.
 */
export function useValue<T, D = undefined>(
  a: D | ValueFn<T>,
  b?: ValueFn<T, D>
): T {
  return into(
    null,
    (): [D, ValueFn<T, D>] => {
      return b ? [a, b] : ([undefined, a] as any);
    },
    ([deps, value]) => {
      const subject = useMemo(
        () =>
          deps === undefined || deps === null
            ? undefined
            : new SourceSubject(deps),
        []
      );

      if (subject) subject.next(deps);

      return useMemo(() => value(subject as any), []);
    }
  );
}
