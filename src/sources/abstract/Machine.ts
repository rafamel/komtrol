import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';
import { Store } from './Store';
import { EmptyUnion, StateMap, Source } from '../types';

const busy = Symbol('busy');
const queue = Symbol('queue');
const error = Symbol('error');

/**
 * A `Store` with an execution queue and a global `Error` stream.
 */
export abstract class Machine<S, T = S, D = EmptyUnion> extends Store<S, T, D>
  implements Source<T> {
  private [error]: Subject<Error>;
  private [busy]: BehaviorSubject<boolean>;
  private [queue]: Array<() => Promise<void>>;
  protected constructor(state: S, deps: D, map: StateMap<S, T>) {
    super(state, deps, map);
    this[error] = new Subject();
    this[busy] = new BehaviorSubject<boolean>(false);
    this[queue] = [];
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
    return this[busy].pipe(skip(1));
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
  protected raise(err: Error): void {
    this[error].next(err);
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
          if (cb) await cb();
        } catch (err) {
          this.raise(err);
        }
      }
      this[busy].next(false);
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

      if (!this.busy) {
        this[busy].next(true);
        start();
      }
    });
  }
}
