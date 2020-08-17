import { MachineEnable, Resource } from './definitions';
import { MachineSubject } from './Machine';
import { SourceEnclosure } from './Source';
import { Observable } from 'rxjs';
import { EmptyUnion } from '../types';

const _machine = Symbol('machine');

export abstract class ResourceEnclosure<
  T,
  D = EmptyUnion
> extends SourceEnclosure<T, D> {
  private [_machine]: MachineSubject;
  protected constructor(state: T, deps: D, enable: MachineEnable) {
    super(state, deps);
    this[_machine] = new MachineSubject(enable);
  }
  protected get active(): boolean {
    return this[_machine].active;
  }
  protected get active$(): Observable<boolean> {
    return this[_machine].active$;
  }
  protected enable(): void {
    return this[_machine].enable();
  }
  protected disable(): void {
    return this[_machine].disable();
  }
}

export abstract class SuperResource<T, D = EmptyUnion>
  extends ResourceEnclosure<T, D>
  implements Resource<T> {
  public get state(): T {
    return super.state;
  }
  public get active(): boolean {
    return super.active;
  }
  public get state$(): Observable<T> {
    return super.state$;
  }
  public get active$(): Observable<boolean> {
    return super.active$;
  }
  public enable(): void {
    return super.enable();
  }
  public disable(): void {
    return super.disable();
  }
}

export class ResourceSubject<T> extends SuperResource<T> {
  public constructor(state: T, enable?: MachineEnable) {
    super(state, null, enable);
  }
  public next(state: Partial<T>, compare?: boolean): void {
    return super.next(state, compare);
  }
}
