import { Observable } from 'rxjs';
import { EmptyUnion } from '../types';
import { SuperMachine } from './Machine';
import { ReporterMachine, Enable, Disable } from './types';
import { ReporterSubject } from './Reporter';

const reporter = Symbol('reporter');

/**
 * A `ReporterMachine` implementation as an abstract class.
 */
export abstract class SuperReporterMachine<D = EmptyUnion>
  extends SuperMachine<D>
  implements ReporterMachine {
  private [reporter]: ReporterSubject;
  protected constructor(deps: D, enable: Enable, disable: Disable) {
    super(deps, enable, disable);
    this[reporter] = new ReporterSubject();
  }
  public get error$(): Observable<Error> {
    return this[reporter].error$;
  }
  protected report(err: Error): void {
    return this[reporter].report(err);
  }
}

export class ReporterMachineSubject extends SuperReporterMachine
  implements ReporterMachine {
  public constructor(enable?: Enable, disable?: Disable) {
    super(null, enable, disable);
  }
  public report(err: Error): void {
    return super.report(err);
  }
}
