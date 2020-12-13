import { Resource } from '../definitions';
import { MachineEnable, MachineSubject } from './Machine';
import { SourceEnclosure } from './Source';
import { Empty, UnaryFn } from 'type-core';
import { Push } from 'multitude/definitions';

export abstract class ResourceEnclosure<
  T = any,
  D = Empty,
  U = T
> extends SourceEnclosure<T, D, U> {
  #machine: MachineSubject;
  protected constructor(
    state: T,
    deps: D,
    enable: MachineEnable,
    projection: UnaryFn<T, U> | Empty
  ) {
    super(state, deps, projection);
    this.#machine = new MachineSubject(enable);
  }
  protected get active(): boolean {
    return this.#machine.active;
  }
  protected get active$(): Push.Observable<boolean> {
    return this.#machine.active$;
  }
  protected enable(): void {
    return this.#machine.enable();
  }
  protected disable(): void {
    return this.#machine.disable();
  }
}

export abstract class SuperResource<T = any, D = Empty, U = T>
  extends ResourceEnclosure<T, D, U>
  implements Resource<U> {
  public get state(): U {
    return super.state;
  }
  public get active(): boolean {
    return super.active;
  }
  public get state$(): Push.Observable<U> {
    return super.state$;
  }
  public get active$(): Push.Observable<boolean> {
    return super.active$;
  }
  public enable(): void {
    return super.enable();
  }
  public disable(): void {
    return super.disable();
  }
}

export class ResourceSubject<T = any, U = T> extends SuperResource<
  T,
  Empty,
  U
> {
  public constructor(
    state: T,
    enable: MachineEnable,
    projection: UnaryFn<T, U> | Empty
  ) {
    super(state, null, enable, projection);
  }
  public next(state: Partial<T>): void {
    return super.next(state);
  }
}
