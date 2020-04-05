import { SuperSource } from './Source';
import { MachineSubject } from './Machine';
import { Observable } from 'rxjs';
import { StateMap, MachineSource, Enable, Disable } from './types';
import { EmptyUnion } from '../types';

const machine = Symbol('machine');

/**
 * A `MachineSource` implementation as an abstract class.
 */
export abstract class SuperMachineSource<S, T = S, D = EmptyUnion>
  extends SuperSource<S, T, D>
  implements MachineSource<T> {
  private [machine]: MachineSubject;
  protected constructor(
    state: S,
    deps: D,
    map: StateMap<S, T>,
    enable: Enable,
    disable: Disable
  ) {
    super(state, deps, map);
    this[machine] = new MachineSubject(enable, disable);
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
}

export class MachineSourceSubject<S, T = S> extends SuperMachineSource<S, T>
  implements MachineSource<T> {
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
}
