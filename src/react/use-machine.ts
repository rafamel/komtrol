import { useEffect } from 'react';
import { Machine, Source } from '../super';
import { EmptyUnion } from '../types';
import { useValue } from './use-value';
import { into } from 'pipettes';

export type MachineFn<T extends Machine, D = undefined> = (
  deps: D extends EmptyUnion ? undefined : Source<D>
) => T;

export function useMachine<T extends Machine>(machine: MachineFn<T>): T;
export function useMachine<T extends Machine, D = undefined>(
  deps: D,
  machine: MachineFn<T, D>
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
    (): [D, MachineFn<T, D>] => {
      return b ? [a, b] : ([undefined, a] as any);
    },
    (params) => {
      const [deps, machine] = params();
      const instance = useValue(deps, machine);

      useEffect(() => {
        instance.enable();
        return () => instance.disable();
      }, []);

      return instance;
    }
  );
}
