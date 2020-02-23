import { Source, StateMap, Reporter, Machine } from '../types';
import {
  Resource,
  ReporterResource,
  MachineResource,
  MachineQueueResource
} from '../abstract';

/**
 * A `Source` whose `state` can be externally updated.
 */
export class Subject<S, T = S> extends Resource<S, T> implements Source<T> {
  public constructor(state: S, map: StateMap<S, T>) {
    super(state, null, map);
  }
  public next(state: Partial<S>, compare?: boolean): void {
    return super.next(state, compare);
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
  public raise(err: Error): void {
    return super.raise(err);
  }
}

export class MachineSubject<S, T = S> extends MachineResource<S, T>
  implements Machine<T> {
  public constructor(state: S, map: StateMap<S, T>) {
    super(state, null, map);
  }
  public next(state: Partial<S>, compare?: boolean): void {
    return super.next(state, compare);
  }
  public raise(err: Error): void {
    return super.raise(err);
  }
  public block(value: boolean): void {
    return super.block(value);
  }
}

export class MachineQueueSubject<S, T = S> extends MachineQueueResource<S, T>
  implements Machine<T> {
  public constructor(state: S, map: StateMap<S, T>) {
    super(state, null, map);
  }
  public next(state: Partial<S>, compare?: boolean): void {
    return super.next(state, compare);
  }
  public raise(err: Error): void {
    return super.raise(err);
  }
  public block(value: boolean): void {
    return super.block(value);
  }
  public async enqueue<T>(fn: () => Promise<T> | T): Promise<T> {
    return super.enqueue(fn);
  }
}
