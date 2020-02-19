import {
  Observable,
  BehaviorSubject,
  merge,
  of,
  combineLatest,
  Subscription
} from 'rxjs';
import { map as _map, pairwise, filter, skip } from 'rxjs/operators';
import { shallowEqual as shallow } from 'shallow-equal-object';
import { Source } from '../types';

const subject = Symbol('subject');
const subscription = Symbol('subscription');

export type OperationCombineInput = Record<string, Source<any>>;
export type OperationCombineState<T extends OperationCombineInput> = {
  [P in keyof T]: T[P]['state'];
};

/**
 * Creates a `Source` resulting from operating on another
 * `Source` or set of `Source`s.
 * `Operation` instances are *hot* and *multicast,*
 * which means they will continue to execute even if
 * it's `state$` is not subscribed to.
 * The `alive` property and `teardown` method exist for this purpose.
 * Once an `Operation` is teared down, it will stop executing,
 * hence its `state$` `Observable` will complete
 * and its `state` will no longer update.
 * To create cold, self stopping, `Observable`s from `Operation`s,
 * see the `operation` util.
 */
export class Operation<T, R = unknown> implements Source<T> {
  /**
   * Returns an `Operation` instance as a combination of `Source`s.
   * Takes a `sources` object with values of `Source`s.
   */
  public static combine<T extends OperationCombineInput>(
    sources: T
  ): Operation<OperationCombineState<T>, T> {
    const entries = Object.entries(sources);

    const initials: any[] = [];
    const observables: Array<Observable<any>> = [];
    for (const entry of entries) {
      const { state, state$ } = entry[1];
      initials.push(state);
      observables.push(merge(of(state), state$));
    }

    const map = (values: any[]): OperationCombineState<T> => {
      const state: Record<string, any> = {};
      for (let i = 0; i < values.length; i++) {
        state[entries[i][0]] = values[i];
      }
      return state as OperationCombineState<T>;
    };

    return new this(
      map(initials),
      combineLatest(observables).pipe(skip(1), _map(map)),
      sources
    );
  }
  /**
   * Returns an `Operation` instance with `state`
   * equal to the return value of `map`.
   * The returned instance will only emit when at least
   * one of the values of its mapped state is different
   * from its previous.
   */
  public static select<T, U, R = Source<T>>(
    source: R & Source<T>,
    map: (value: T) => U
  ): Operation<U, R> {
    const state = map(source.state);

    return new this(
      state,
      merge(of(state), source.state$.pipe(_map(map))).pipe(
        pairwise(),
        filter(([previous, current]) => !shallow(previous, current)),
        _map((arr) => arr[1])
      ),
      source
    );
  }
  public source: R;
  private [subject]: BehaviorSubject<T>;
  private [subscription]: Subscription;
  private constructor(initial: T, observable: Observable<T>, source: R) {
    this.source = source;
    this[subject] = new BehaviorSubject(initial);
    this[subscription] = observable.subscribe(this[subject]);
  }
  /**
   * Whether the operation is currently executing -it hasn't
   * been teared down. See `Operation.teardown`.
   */
  public get alive(): boolean {
    return !this[subject].isStopped;
  }
  public get state(): T {
    return this[subject].value;
  }
  public get state$(): Observable<T> {
    return this[subject].pipe(skip(1));
  }
  /**
   * Tears down and `Operation` instance.
   * The operation will stop executing,
   * its `state$` `Observable` will complete,
   * and its `state` will no longer update.
   */
  public teardown(): void {
    this[subscription].unsubscribe();
    this[subject].complete();
  }
}
