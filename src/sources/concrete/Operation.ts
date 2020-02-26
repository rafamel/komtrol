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
import {
  Source,
  ReporterValue,
  MachineValue,
  SourcesRecord,
  SourcesRecordCombineState
} from '../types';

const single = Symbol('single');
const subject = Symbol('subject');
const subscription = Symbol('subscription');

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
  public static combine<T extends SourcesRecord>(
    sources: T
  ): Operation<SourcesRecordCombineState<T>, T> {
    const entries = Object.entries(sources);

    const initials: any[] = [];
    const observables: Array<Observable<any>> = [];
    for (const entry of entries) {
      const { state, state$ } = entry[1];
      initials.push(state);
      observables.push(state$);
    }

    const map = (values: any[]): SourcesRecordCombineState<T> => {
      const state: Record<string, any> = {};
      for (let i = 0; i < values.length; i++) {
        state[entries[i][0]] = values[i];
      }
      return state as SourcesRecordCombineState<T>;
    };

    const values = map(initials);
    return new this(
      values,
      merge(of(values), combineLatest(observables).pipe(skip(1), _map(map))),
      sources,
      true
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
      merge(
        of(state),
        merge(of(state), source.state$.pipe(skip(1), _map(map))).pipe(
          pairwise(),
          filter(([previous, current]) => !shallow(previous, current)),
          _map((arr) => arr[1])
        )
      ),
      source as R,
      false
    );
  }
  public source: R;
  private [single]: boolean;
  private [subject]: BehaviorSubject<T>;
  private [subscription]: Subscription;
  private constructor(
    initial: T,
    observable: Observable<T>,
    source: R,
    record: boolean
  ) {
    this.source = source;
    this[single] = !record;
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
    return this[subject].asObservable();
  }
  public get error$(): ReporterValue<R, 'error$'> {
    const source: any = this.source;
    if (this[single]) return source.error$;

    const arr = Object.values(source)
      .map((source: any) => source.error$)
      .filter((error$) => Boolean(error$));

    if (!arr.length) return undefined as any;
    return merge(...arr) as any;
  }
  public get busy(): MachineValue<R, 'busy'> {
    const source: any = this.source;
    if (this[single]) return source.busy;

    const arr = Object.values(source)
      .map((source: any) => source.busy)
      .filter((busy) => typeof busy === 'boolean');

    if (!arr.length) return undefined as any;
    return arr.reduce((acc, busy) => acc || busy, false);
  }
  public get busy$(): MachineValue<R, 'busy$'> {
    const source: any = this.source;
    if (this[single]) return source.busy$;

    const arr = Object.values(source)
      .map(
        (source: any) =>
          [source.busy, source.busy$] as [boolean, Observable<boolean>]
      )
      .filter(([busy, busy$]) => typeof busy === 'boolean' && Boolean(busy$));

    if (!arr.length) return undefined as any;

    const map = (values: boolean[]): boolean => {
      return values.reduce((acc, busy) => acc || busy);
    };
    const initial = map(arr.map(([busy]) => busy));
    return merge(
      of(initial),
      merge(
        of(initial),
        combineLatest(arr.map((item) => item[1])).pipe(skip(1), _map(map))
      ).pipe(
        pairwise(),
        filter(([a, b]) => a !== b),
        _map((values) => values[1])
      )
    ) as any;
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
