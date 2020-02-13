import { Observable } from 'rxjs';

/**
 * A basic definition of a `Source`.
 */
export interface Source<T> {
  state: T;
  state$: Observable<T>;
}
