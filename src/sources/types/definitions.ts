import { Observable } from 'rxjs';

/**
 * A basic definition of a `Source`.
 */
export interface Source<T> {
  state: T;
  state$: Observable<T>;
}

/**
 * A `Source` with an `Error` stream.
 * See `Reporter`.
 */
export interface Reporter<T> extends Source<T> {
  error$: Observable<Error>;
}

/**
 * A `Reporter` with an independent execution state.
 * See `Reporter`.
 */
export interface Machine<T> extends Reporter<T> {
  busy: boolean;
  busy$: Observable<boolean>;
}
