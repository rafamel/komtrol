import { Observable, BehaviorSubject } from 'rxjs';
import { EmptyUnion, StateMap, Machine } from '../types';
import { ReporterResource } from './ReporterResource';

const busy = Symbol('busy');
const queue = Symbol('queue');
const manual = Symbol('manual');

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

export abstract class MachineQueueResource<S, T = S, D = EmptyUnion>
  extends MachineResource<S, T, D>
  implements Machine<T> {
  private [queue]: Array<() => Promise<void>>;
  private [manual]: boolean;
  protected constructor(state: S, deps: D, map: StateMap<S, T>) {
    super(state, deps, map);
    this[queue] = [];
    this[manual] = false;
  }
  /**
   * Controls the `busy` property and `busy$` stream.
   * If set to `true`, `busy` but won't automatically
   * be set to false on queue finalization.
   */
  protected engage(value: boolean): void {
    super.engage(value);
    this[manual] = this.busy;
  }
  /**
   * Adds a task -`fn`- to be executed.
   * It will start once the last task in the queue -if any- has completed.
   * All `Error`s thrown will be automatically added to the `error$` stream.
   * Returns a `Promise` that resolves with the value returned by `fn`.
   */
  protected async enqueue<T>(fn: () => Promise<T> | T): Promise<T> {
    const start = async (): Promise<void> => {
      while (this[queue].length) {
        try {
          const cb = this[queue].shift();
          /* istanbul ignore next */
          if (cb) await cb();
        } catch (err) {
          this.report(err);
        }
      }
      if (!this[manual]) super.engage(false);
    };

    return new Promise<T>((resolve, reject) => {
      this[queue].push(async () => {
        try {
          const value = await fn();
          resolve(value);
        } catch (err) {
          reject(err);
          throw err;
        }
      });

      if (!this.busy || this[manual]) {
        super.engage(true);
        start();
      }
    });
  }
}
