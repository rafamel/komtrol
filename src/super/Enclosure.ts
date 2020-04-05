import { Observable, BehaviorSubject } from 'rxjs';
import { shallow } from 'equal-strategies';
import { StateMap, Source } from './types';
import { EmptyUnion } from '../types';

const next = Symbol('next');
const source = Symbol('source');
const internal = Symbol('internal');

/**
 * The most basic abstract class.
 * The `state` and `state$` properties, as well as the `next` method,
 * are set as `protected` instead of `public`.
 * For cases when the state is only to be used internally by the class.
 */
export abstract class Enclosure<S, T = S, D = EmptyUnion> {
  private [next]: (state: S) => void;
  private [source]: Source<S>;
  private [internal]: Source<T>;
  protected deps: D;
  protected constructor(state: S, deps: D, map: StateMap<S, T>) {
    this.deps = deps;

    const create = Object.create.bind(null, {});
    const value: S =
      typeof state === 'object' && state !== null && !Array.isArray(state)
        ? { ...state }
        : state;

    const subject = new BehaviorSubject<S>(value);
    this[source] = create({
      state: { get: () => subject.value },
      state$: { value: subject.asObservable() }
    });

    if (map) {
      const destination = new BehaviorSubject<T>(map(value));
      this[next] = (state: S) => {
        subject.next(state);
        destination.next(map(state));
      };
      this[internal] = create({
        state: { get: () => destination.value },
        state$: { value: destination.asObservable() }
      });
    } else {
      this[next] = (state: S) => subject.next(state);
      this[internal] = this[source] as Source<any>;
    }
  }
  /**
   * A `Source` without the state map applied.
   */
  protected get source(): Source<S> {
    return this[source];
  }
  /**
   * Current instance state.
   */
  protected get state(): T {
    return this[internal].state;
  }
  /**
   * An `Observable` that emits the new `state`
   * when updated through the `next` method.
   */
  protected get state$(): Observable<T> {
    return this[internal].state$;
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
        ? { ...this.source.state, ...state }
        : (state as any);

    if (compare && shallow(update, this.source.state)) return;

    this[next](update);
  }
}
