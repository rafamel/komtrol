import { Subject, Observable } from 'rxjs';
import { Resource } from './source';
import { EmptyUnion, StateMap, Reporter } from './types';

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
  protected report(err: Error): void {
    this[error].next(err);
  }
}

export class ReporterSubject<S, T = S> extends ReporterResource<S, T>
  implements Reporter<T> {
  public constructor(state: S, map: StateMap<S, T>) {
    super(state, null, map);
  }
  public next(state: Partial<S>, compare?: boolean): void {
    return super.next(state, compare);
  }
  public report(err: Error): void {
    return super.report(err);
  }
}
