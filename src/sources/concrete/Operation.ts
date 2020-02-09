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

export class Operation<T> implements Source<T> {
  public static combine<T extends OperationCombineInput>(
    sources: T
  ): Operation<OperationCombineState<T>> {
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
      combineLatest(observables).pipe(skip(1), _map(map))
    );
  }
  public static select<T, U>(
    source: Source<T>,
    map: (value: T) => U
  ): Operation<U> {
    const state = map(source.state);

    return new this(
      state,
      merge(of(state), source.state$.pipe(_map(map))).pipe(
        pairwise(),
        filter(([previous, current]) => !shallow(previous, current)),
        _map((arr) => arr[1])
      )
    );
  }
  private [subject]: BehaviorSubject<T>;
  private [subscription]: Subscription;
  private constructor(initial: T, observable: Observable<T>) {
    this[subject] = new BehaviorSubject(initial);
    this[subscription] = observable.subscribe(this[subject]);
  }
  public get alive(): boolean {
    return !this[subject].isStopped;
  }
  public get state(): T {
    return this[subject].value;
  }
  public get state$(): Observable<T> {
    return this[subject].pipe(skip(1));
  }
  public teardown(): void {
    this[subscription].unsubscribe();
    this[subject].complete();
  }
}
