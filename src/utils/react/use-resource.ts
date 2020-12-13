import { Resource } from '../../definitions';
import { NullaryFn } from 'type-core';
import { ReactHooksDependency } from 'multitude/push';
import { useSource } from './use-source';
import { useMachine } from './use-machine';

/**
 * Shorthand for calling `useMachine` and `useSource` on a *Resource.*
 */
export function useResource<T extends Resource<any>>(
  React: ReactHooksDependency,
  create: NullaryFn<T>
): T {
  const instance = useMachine(React, create);
  useSource(React, () => instance);
  return instance;
}
