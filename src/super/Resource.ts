import { SuperSource } from './Source';
import { ReporterSubject } from './Reporter';
import { MachineSubject } from './Machine';
import { Observable } from 'rxjs';
import { StateMap, Enable, Disable, Resource } from './types';
import { EmptyUnion } from '../types';

const reporter = Symbol('reporter');
const machine = Symbol('machine');

/**
 * A `MachineSource` implementation as an abstract class.
 */
export abstract class SuperResource<S, T = S, D = EmptyUnion>
  extends SuperSource<S, T, D>
  implements Resource<T> {
  private [reporter]: ReporterSubject;
  private [machine]: MachineSubject;
  protected constructor(
    state: S,
    deps: D,
    map: StateMap<S, T>,
    enable: Enable,
    disable: Disable
  ) {
    super(state, deps, map);
    this[reporter] = new ReporterSubject();
    this[machine] = new MachineSubject(enable, disable);
  }
  public get error$(): Observable<Error> {
    return this[reporter].error$;
  }
  public get active(): boolean {
    return this[machine].active;
  }
  public get active$(): Observable<boolean> {
    return this[machine].active$;
  }
  public enable(): void {
    return this[machine].enable();
  }
  public disable(): void {
    return this[machine].disable();
  }
  protected report(err: Error): void {
    return this[reporter].report(err);
  }
}

export class ResourceSubject<S, T = S> extends SuperResource<S, T>
  implements Resource<T> {
  public constructor(
    state: S,
    map?: StateMap<S, T>,
    enable?: Enable,
    disable?: Disable
  ) {
    super(state, null, map as StateMap<S, T>, enable, disable);
  }
  public next(state: Partial<S>, compare?: boolean): void {
    return super.next(state, compare);
  }
  public report(err: Error): void {
    return super.report(err);
  }
}
