import { Observable, BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';
import { shallowEqual as shallow } from 'shallow-equal-object';
import { EmptyUnion, StateMapFn, StateMap } from '../types';

const fn = Symbol('fn');
const value = Symbol('value');
const subject = Symbol('subject');

/**
 * The most basic abstract class.
 * The `state` and `state$` properties, as well as the `next` method,
 * are set as `protected` instead of `public`.
 * For cases when the state is only to be used internally by the class.
 */
export abstract class Enclosure<S, T = S, D = EmptyUnion> {
  private [fn]: StateMapFn<S, T>;
  private [value]: S;
  private [subject]: BehaviorSubject<T>;
  protected deps: D;
  protected constructor(state: S, deps: D, map: StateMap<S, T>) {
    this[fn] = (map || ((state: S) => state)) as StateMapFn<S, T>;
    this[value] = state;
    this[subject] = new BehaviorSubject(this[fn](state));
    this.deps = deps as D;
  }
  /**
   * Current instance state.
   */
  protected get state(): T {
    return this[subject].value;
  }
  /**
   * An `Observable` that emits the new `state`
   * when updated through the `next` method.
   */
  protected get state$(): Observable<T> {
    return this[subject].pipe(skip(1));
  }
  /**
   * Updates the instance `state`.
   * If it is an *object,* it will create a new state *object*
   * by merging `state` with the current instance state.
   * If `compare` is `true` and the current `state` is shallow
   * equal to its update, it won't emit.
   */
  protected next(state: Partial<S>, compare?: boolean): void {
    const update =
      typeof state === 'object' && state !== null
        ? { ...this[value], ...state }
        : state;

    if (compare && shallow(update, this[value])) return;

    let next = this[fn](update);
    if (
      next === this[subject].value &&
      typeof next === 'object' &&
      next !== null
    ) {
      next = { ...next };
    }

    this[value] = update;
    this[subject].next(next);
  }
}
