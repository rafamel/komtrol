import { Observable, BehaviorSubject } from 'rxjs';
import { EmptyUnion, StateMap, Machine } from '../types';
import { ReporterResource } from './ReporterResource';

const busy = Symbol('busy');

/**
 * A `Machine` implementation as an abstract class.
 */
export abstract class MachineResource<S, T = S, D = EmptyUnion>
  extends ReporterResource<S, T, D>
  implements Machine<T> {
  private [busy]: BehaviorSubject<boolean>;
  protected constructor(state: S, deps: D, map: StateMap<S, T>) {
    super(state, deps, map);
    this[busy] = new BehaviorSubject<boolean>(false);
  }
  /**
   * Whether there are tasks in the queue currently executing.
   */
  public get busy(): boolean {
    return this[busy].value;
  }
  /**
   * Observable streaming changes in `instance.busy`.
   */
  public get busy$(): Observable<boolean> {
    return this[busy].asObservable();
  }
  /**
   * Controls the `busy` property and `busy$` stream.
   */
  protected engage(value: boolean): void {
    if (typeof value !== 'boolean') {
      throw Error(`Value must be a boolean`);
    }
    if (this.busy && !value) this[busy].next(false);
    else if (!this.busy && value) this[busy].next(true);
  }
}
