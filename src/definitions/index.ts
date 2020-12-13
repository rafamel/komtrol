import { Push } from 'multitude/definitions';

/**
 * A basic definition of a `Source`.
 */
export interface Source<T = any> {
  state: T;
  state$: Push.Observable<T>;
}

/**
 * A basic definition of a `Machine`.
 */
export interface Machine {
  active: boolean;
  active$: Push.Observable<boolean>;
  enable(): void;
  disable(): void;
}

/**
 * An intersection of a `Source` and a `Machine`
 */
export type Resource<T = any> = Source<T> & Machine;
