import { Source } from '../definitions';
import { Empty, TypeGuard, UnaryFn } from 'type-core';
import { Push } from 'multitude/definitions';
import { Observable, Subject, changes, share } from 'multitude/push';
import { into } from 'pipettes';

/**
 * The most basic Source abstract class.
 * The `state` and `state$` properties, as well as the `next` method,
 * are set as `protected` instead of `public`.
 * For cases when the state is only to be used internally by the class.
 */
export abstract class SourceEnclosure<T = any, D = Empty, U = T> {
  #projection: UnaryFn<T, U>;
  #subject: Push.Subject<U, U>;
  #observable: Push.Observable<U>;
  protected deps: D;
  protected source: T;
  protected constructor(state: T, deps: D, projection: UnaryFn<T, U> | Empty) {
    const value = TypeGuard.isRecord(state) ? { ...state } : state;
    const project = projection || ((value: T): U => value as any);

    this.deps = deps;
    this.source = value;
    this.#projection = project;
    this.#subject = Subject.of(project(value), { replay: true });
    this.#observable = into(
      this.#subject,
      changes('shallow'),
      share({ policy: 'on-demand', replay: true }),
      Observable.from
    );
  }
  /**
   * Current instance state.
   */
  protected get state(): U {
    return this.#subject.value;
  }
  /**
   * An multicast *Observable* that emits the new `state`
   * when updated through the `next` method.
   */
  protected get state$(): Push.Observable<U> {
    return this.#observable;
  }
  /**
   * Updates the instance `state`.
   * If it is an *object,* it will create a new state *object*
   * by merging `state` with the current instance state.
   */
  protected next(state: Partial<T>): void {
    const source = this.source;
    const subject = this.#subject;

    const next = TypeGuard.isRecord(state) ? { ...source, ...state } : state;
    this.source = next;
    subject.next(this.#projection(next));
  }
}

/**
 * A `Source` implementation as an abstract class. See `SourceEnclosure`.
 */
export abstract class SuperSource<T = any, D = Empty, U = T>
  extends SourceEnclosure<T, D, U>
  implements Source<U> {
  public get state(): U {
    return super.state;
  }
  public get state$(): Push.Observable<U> {
    return super.state$;
  }
}

/**
 * A `Source` whose `state` can be externally updated.
 */
export class SourceSubject<T = any, U = T>
  extends SuperSource<T, Empty, U>
  implements Source<U> {
  public constructor(state: T, projection: UnaryFn<T, U> | Empty) {
    super(state, null, projection);
  }
  public next(state: Partial<T>): void {
    return super.next(state);
  }
}
