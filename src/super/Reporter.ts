import { Subject, Observable } from 'rxjs';
import { Reporter } from './types';
import { EmptyUnion } from '../types';

const error = Symbol('error');

/**
 * A `Reporter` implementation as an abstract class.
 */
export abstract class SuperReporter<D = EmptyUnion> implements Reporter {
  private [error]: Subject<Error>;
  protected deps: D;
  protected constructor(deps: D) {
    this[error] = new Subject();
    this.deps = deps;
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

export class ReporterSubject extends SuperReporter implements Reporter {
  public constructor() {
    super(null);
  }
  public report(err: Error): void {
    return super.report(err);
  }
}
