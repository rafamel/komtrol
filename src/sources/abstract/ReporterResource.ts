import { EmptyUnion, StateMap, Reporter } from '../types';
import { Subject, Observable } from 'rxjs';
import { Resource } from './Resource';

const error = Symbol('error');

/**
 * A `Reporter` implementation as an abstract class.
 */
export abstract class ReporterResource<S, T = S, D = EmptyUnion>
  extends Resource<S, T, D>
  implements Reporter<T> {
  private [error]: Subject<Error>;
  protected constructor(state: S, deps: D, map: StateMap<S, T>) {
    super(state, deps, map);
    this[error] = new Subject();
  }
  /**
   * `Error` stream.
   */
  public get error$(): Observable<Error> {
    return this[error].asObservable();
  }
  /**
   * Adds an `Error` to the instance `error$` stream.
   */
  protected raise(err: Error): void {
    this[error].next(err);
  }
}
