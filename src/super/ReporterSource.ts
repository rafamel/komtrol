import { SuperSource } from './Source';
import { ReporterSubject } from './Reporter';
import { Observable } from 'rxjs';
import { StateMap, ReporterSource } from './types';
import { EmptyUnion } from '../types';

const reporter = Symbol('reporter');

/**
 * A `ReporterSource` implementation as an abstract class.
 */
export abstract class SuperReporterSource<S, T = S, D = EmptyUnion>
  extends SuperSource<S, T, D>
  implements ReporterSource<T> {
  private [reporter]: ReporterSubject;
  protected constructor(state: S, deps: D, map: StateMap<S, T>) {
    super(state, deps, map);
    this[reporter] = new ReporterSubject();
  }
  public get error$(): Observable<Error> {
    return this[reporter].error$;
  }
  protected report(err: Error): void {
    return this[reporter].report(err);
  }
}

export class ReporterSourceSubject<S, T = S> extends SuperReporterSource<S, T>
  implements ReporterSource<T> {
  public constructor(state: S, map?: StateMap<S, T>) {
    super(state, null, map as StateMap<S, T>);
  }
  public next(state: Partial<S>, compare?: boolean): void {
    return super.next(state, compare);
  }
  public report(err: Error): void {
    return super.report(err);
  }
}
