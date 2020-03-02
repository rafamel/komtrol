import { Observable, BehaviorSubject } from 'rxjs';
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
    this[value] =
      typeof state === 'object' && state !== null && !Array.isArray(state)
        ? { ...state }
        : state;
    this[subject] = new BehaviorSubject(this[fn](this[value]));
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
    return this[subject].asObservable();
  }
  /**
   * Updates the instance `state`.
   * If it is an *object,* it will create a new state *object*
   * by merging `state` with the current instance state.
   * If `compare` is `true` and the current `state` is shallow
   * equal to its update, it won't emit.
   */
  protected next(state: Partial<S>, compare?: boolean): void {
    const update: S =
      typeof state === 'object' && state !== null && !Array.isArray(state)
        ? { ...this[value], ...state }
        : (state as any);

    if (compare && shallow(update, this[value])) return;

    this[value] = update;
    this[subject].next(this[fn](update));
  }
}
