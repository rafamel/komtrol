import { Source, MachineSource } from '../super';
import { pipeInto as into } from 'ts-functional-pipe';
import { EmptyUnion } from '../types';
import { useSource } from './use-source';
import { useMachine } from './use-machine';

export type ControllerFn<T extends MachineSource<any>, D = undefined> = (
  deps: D extends EmptyUnion ? undefined : Source<D>
) => T;

export function useController<T extends MachineSource<any>>(
  controller: ControllerFn<T>
): T;
export function useController<T extends MachineSource<any>, D = undefined>(
  deps: D,
  controller: ControllerFn<T, D>
): T;

/**
 * Expects a `MachineSource` or `Resource` to subscribe to,
 * in addition to calling its `enable` and `disable` methods.
 * Dependencies will be optionally passed as a `Source`.
 * Similar to calling `useSource` and `useMachine`.
 */
export function useController<T extends MachineSource<any>, D = undefined>(
  a: ControllerFn<T, D> | D,
  b?: ControllerFn<T, D>
): T {
  return into(
    null,
    (): [D, ControllerFn<T, D>] => {
      return b ? [a, b] : ([undefined, a] as any);
    },
    ([deps, controller]) => {
      const instance = useSource(deps, controller);
      useMachine(() => instance);

      return instance;
    }
  );
}
