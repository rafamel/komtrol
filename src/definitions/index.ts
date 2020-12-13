import { Push } from 'multitude/definitions';

/**
 * A basic definition of a `Source`.
 */
export interface Source<T = any> {
  state: T;
  state$: Push.Observable<T>;
}

/**
 * An object with with a boolean and boolean stream properties indicating activity.
 */
export interface Machine {
  active: boolean;
  active$: Push.Observable<boolean>;
  enable(): void;
  disable(): void;
}

/**
 * A `Source` that is also a `Machine`.
 */
export type Resource<T = any> = Source<T> & Machine;
