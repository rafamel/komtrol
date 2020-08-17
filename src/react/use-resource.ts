import { useRef } from 'react';
import { Resource, Source } from '../super';
import { into } from 'pipettes';
import { NonDefinedUnion } from '../types';
import { useSource } from './use-source';
import { useMachine } from './use-machine';

const noblock = (): boolean => false;

export type ResourceFn<T extends Resource<any>, P = void> = (
  props: P extends NonDefinedUnion ? undefined : Source<P>
) => T;

export function useResource<T extends Resource<any>>(
  resource: ResourceFn<T>
): T;
export function useResource<T extends Resource<any>, P = void>(
  props: P,
  resource: ResourceFn<T, P>,
  block?: () => boolean
): T;

/**
 * Expects a `Resource` to subscribe to,
 * in addition to calling its `enable` and `disable` methods.
 * Optionally, `props` can be passed as a `Source`.
 * Similar to calling `useSource` and `useMachine`.
 */
export function useResource<T extends Resource<any>, P = void>(
  a: ResourceFn<T, P> | P,
  b?: ResourceFn<T, P>,
  c?: () => boolean
): T {
  return into(
    (): [P, ResourceFn<T, P>, () => boolean] => {
      return b ? [a, b, c || noblock] : ([undefined, a, noblock] as any);
    },
    (params) => {
      const [props, resourceFn, block] = params();

      const running = useRef<boolean>(true);
      running.current = true;

      const instance = useSource(
        props,
        resourceFn,
        () => running.current || block()
      );
      useMachine(() => instance);

      running.current = false;
      return instance;
    }
  );
}
