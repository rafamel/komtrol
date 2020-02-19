import { Store } from '../abstract/Store';
import { Source, StateMap } from '../types';

/**
 * A `Source` whose `state` can be externally updated.
 */
export class Subject<S, T = S> extends Store<S, T> implements Source<T> {
  public constructor(state: S, map: StateMap<S, T>) {
    super(state, null, map);
  }
  /**
   * Updates the instance `state`.
   * See `Enclosure.next`.
   */
  public next(state: Partial<S>, compare?: boolean): void {
    return super.next(state, compare);
  }
}

/**
 * A `Subject` for cases when a state map isn't needed.
 * See `Subject`.
 */
export class PureSubject<T> extends Subject<T, T> implements Source<T> {
  public constructor(state: T) {
    super(state, (state) => state);
  }
}
