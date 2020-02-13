import { Observable } from 'rxjs';

/**
 * A basic definition of a `Source`.
 */
export interface Source<T> {
  state: T;
  state$: Observable<T>;
}

/**
 * A `Source` with an independent execution state
 * and an `Error` stream.
 * See `Machine`.
 */
export interface Resource<T> extends Source<T> {
  busy: boolean;
  busy$: Observable<boolean>;
  error$: Observable<Error>;
}
