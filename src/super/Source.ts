import { Observable, BehaviorSubject } from 'rxjs';
import { shallow } from 'equal-strategies';
import { EmptyUnion } from '../types';
import { Source } from './definitions';

const _subject = Symbol('subject');
const _observable = Symbol('observable');

/**
 * The most basic Source abstract class.
 * The `state` and `state$` properties, as well as the `next` method,
 * are set as `protected` instead of `public`.
 * For cases when the state is only to be used internally by the class.
 */
export abstract class SourceEnclosure<T, D = EmptyUnion> {
  private [_subject]: BehaviorSubject<T>;
  private [_observable]: Observable<T>;
  protected deps: D;
  protected constructor(state: T, deps: D) {
    const value =
      typeof state === 'object' && state !== null && !Array.isArray(state)
        ? { ...state }
        : state;

    this.deps = deps;
    this[_subject] = new BehaviorSubject<T>(value);
    this[_observable] = this[_subject].asObservable();
  }
  /**
   * Current instance state.
   */
  protected get state(): T {
    return this[_subject].value;
  }
  /**
   * An `Observable` that emits the new `state`
   * when updated through the `next` method.
   */
  protected get state$(): Observable<T> {
    return this[_observable];
  }
  /**
   * Updates the instance `state`.
   * If it is an *object,* it will create a new state *object*
   * by merging `state` with the current instance state.
   * If the current `state` is shallow equal to its update
   * and `compare` is `true`, it won't emit.
   */
  protected next(state: Partial<T>, compare?: boolean): void {
    const subject = this[_subject];

    if (typeof state === 'object' && state !== null) {
      /* Array */
      if (Array.isArray(state)) {
        if (compare && shallow(state, subject.value)) return;
        return subject.next(state as any);
      }

      /* Object */
      const value = { ...subject.value, ...state };
      if (compare && shallow(value, subject.value)) return;
      return subject.next(value);
    }

    /* Other types */
    if (compare && subject.value === state) return;
    return subject.next(state);
  }
}

/**
 * A `Source` implementation as an abstract class.
 */
export abstract class SuperSource<T, D = EmptyUnion>
  extends SourceEnclosure<T, D>
  implements Source<T> {
  /**
   * See `Enclosure.state`.
   */
  public get state(): T {
    return super.state;
  }
  /**
   * See `Enclosure.state$`.
   */
  public get state$(): Observable<T> {
    return super.state$;
  }
}

/**
 * A `Source` whose `state` can be externally updated.
 */
export class SourceSubject<T> extends SuperSource<T> implements Source<T> {
  public constructor(state: T) {
    super(state, null);
  }
  public next(state: Partial<T>, compare?: boolean): void {
    return super.next(state, compare);
  }
}
