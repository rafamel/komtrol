import { useEffect } from 'react';
import { Machine, Source } from '../super';
import { pipeInto as into } from 'ts-functional-pipe';
import { EmptyUnion } from '../types';
import { useValue } from './use-value';

export type MachineFn<T extends Machine, D = undefined> = (
  deps: D extends EmptyUnion ? undefined : Source<D>
) => T;

export function useMachine<T extends Machine>(machine: MachineFn<T>): T;
export function useMachine<T extends Machine, D = undefined>(
  deps: D,
  machine: MachineFn<T>
): T;

/**
 * Calls `Machine.enable` upon mount and `Machine.disable`
 * upon unmount, optionally passing dependencies as a `Source`.
 */
export function useMachine<T extends Machine, D = undefined>(
  a: MachineFn<T> | D,
  b?: MachineFn<T>
): T {
  return into(
    null,
    (): [D, MachineFn<T, D>] => {
      return b ? [a, b] : ([undefined, a] as any);
    },
    ([deps, machine]) => {
      const instance = useValue(deps, machine);

      useEffect(() => {
        instance.enable();
        return () => instance.disable();
      }, []);

      return instance;
    }
  );
}
