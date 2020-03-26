import { Source, EmptyUnion } from '../sources';

export interface Lifecycle<D = any> {
  /**
   * Executes once, on component mount.
   */
  mount?: (deps: D) => void;
  /**
   * Executes on every render, including mounts and updates.
   */
  every?: (deps: D, previous: D | null) => void;
  /**
   * Executes on every render if the context is shallowly unequal to the previous.
   */
  update?: (deps: D, previous: D) => void;
  /**
   * Executes once, on component unmount.
   */
  unmount?: () => void;
}

export type LifecycleFn<T extends Source<any>, D = EmptyUnion> = (
  controller: T
) => Lifecycle<D>;
