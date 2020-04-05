import { Source } from '../super';
import { pipeInto as into } from 'ts-functional-pipe';
import { useObservable } from './use-observable';
import { EmptyUnion } from '../types';
import { useValue } from './use-value';

export type SourceFn<T extends Source<any>, D = undefined> = (
  deps: D extends EmptyUnion ? undefined : Source<D>
) => T;

export function useSource<T extends Source<any>>(source: SourceFn<T>): T;
export function useSource<T extends Source<any>, D = undefined>(
  deps: D,
  source: SourceFn<T, D>
): T;

/**
 * Subscribes to a `Source`, optionally passing
 * dependencies as a `Source`.
 */
export function useSource<T extends Source<any>, D = undefined>(
  a: SourceFn<T, D> | D,
  b?: SourceFn<T, D>
): T {
  return into(
    null,
    (): [D, SourceFn<T, D>] => {
      return b ? [a, b] : ([undefined, a] as any);
    },
    ([deps, source]) => {
      const instance = useValue(deps, source);
      useObservable(null, instance.state, () => instance.state$);

      return instance;
    }
  );
}
