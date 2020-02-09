import { Observable } from 'rxjs';

export interface Source<T> {
  state: T;
  state$: Observable<T>;
}
