import { useEffect, useMemo } from 'react';
import { Machine, Source } from '../super';
import { NonDefinedUnion } from '../types';
import { useValue } from './use-value';
import { into } from 'pipettes';

export type MachineFn<T extends Machine, P = void> = (
  props: P extends NonDefinedUnion ? undefined : Source<P>
) => T;

export function useMachine<T extends Machine>(machine: MachineFn<T>): T;
export function useMachine<T extends Machine, P = void>(
  props: P,
  machine: MachineFn<T, P>
): T;

/**
 * Calls `Machine.enable` upon mount and `Machine.disable`
 * upon unmount, optionally passing `props` as a `Source`.
 */
export function useMachine<T extends Machine, P = void>(
  a: MachineFn<T> | P,
  b?: MachineFn<T>
): T {
  return into(
    (): [P, MachineFn<T, P>] => {
      return b ? [a, b] : ([undefined, a] as any);
    },
    (params) => {
      const [props, machineFn] = params();
      const instance = useValue(props, machineFn);

      useMemo(() => instance.enable(), []);
      useEffect(() => () => instance.disable(), []);

      return instance;
    }
  );
}
