import { Observable } from 'rxjs';

/**
 * A basic definition of a `Source`.
 */
export interface Source<T> {
  state: T;
  state$: Observable<T>;
}

/**
 * An object with with a boolean and boolean stream properties indicating activity.
 */
export interface Machine {
  active: boolean;
  active$: Observable<boolean>;
  enable(): void;
  disable(): void;
}

/**
 * A `Source` that is also a `Machine`.
 */
export type Resource<T> = Source<T> & Machine;
