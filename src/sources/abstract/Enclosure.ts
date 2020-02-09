import { Observable, BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';
import { EmptyUnion, StateMapFn, StateMap } from '../types';

const fn = Symbol('fn');
const value = Symbol('value');
const subject = Symbol('subject');

export abstract class Enclosure<S, T = S, D = EmptyUnion> {
  private [fn]: StateMapFn<S, T>;
  private [value]: S;
  private [subject]: BehaviorSubject<T>;
  protected deps: D;
  protected constructor(state: S, dependencies: D, map: StateMap<S, T>) {
    this[fn] = (map || ((state: S) => state)) as StateMapFn<S, T>;
    this[value] = state;
    this[subject] = new BehaviorSubject(this[fn](state));
    this.deps = dependencies as D;
  }
  protected get state(): T {
    return this[subject].value;
  }
  protected get state$(): Observable<T> {
    return this[subject].pipe(skip(1));
  }
  protected next(state: Partial<S>): void {
    const update =
      typeof state === 'object' && state !== null
        ? { ...this[value], ...state }
        : state;

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
