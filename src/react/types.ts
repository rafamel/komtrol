import { Source, EmptyUnion } from '../sources';

export interface Lifecycle<C = any> {
  /**
   * Executes once, on component mount.
   */
  mount?: (context: C) => void;
  /**
   * Executes on every render, including mounts and updates.
   */
  every?: (context: C, previous: C | null) => void;
  /**
   * Executes on every render if the context is shallowly unequal to the previous.
   */
  update?: (context: C, previous: C) => void;
  /**
   * Executes once, on component unmount.
   */
  unmount?: () => void;
}

export type LifecycleFn<T extends Source<any>, C = EmptyUnion> = (
  controller: T
) => Lifecycle<C>;
