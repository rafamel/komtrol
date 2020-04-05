import { Observable } from 'rxjs';

/**
 * A basic definition of a `Source`.
 */
export interface Source<T> {
  state: T;
  state$: Observable<T>;
}

/**
 * An object with an `Error` stream.
 */
export interface Reporter {
  error$: Observable<Error>;
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
 * See `Machine` and `Reporter`.
 */
export type ReporterMachine = Machine & Reporter;

/**
 * See `Source` and `Reporter`.
 */
export type ReporterSource<T> = Source<T> & Reporter;

/**
 * See `Source` and `Machine`.
 */
export type MachineSource<T> = Source<T> & Machine;

/**
 * See `Source`, `Reporter`, and `Machine`.
 */
export type Resource<T> = Source<T> & Reporter & Machine;
