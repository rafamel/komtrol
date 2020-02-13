import { Observable } from 'rxjs';
import { Enclosure } from '../abstract/Enclosure';
import { Source, EmptyUnion } from '../types';

/**
 * An `Enclosure` implementing `Source`. See `Enclosure`.
 * For cases when state is to be used externally to the class.
 */
export abstract class Store<S, T = S, D = EmptyUnion> extends Enclosure<S, T, D>
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
 * A `Store` for cases when a state map isn't needed.
 * See `Store`.
 */
export abstract class PureStore<T, D = EmptyUnion> extends Store<T, T, D>
  implements Source<T> {
  public constructor(state: T, deps: D) {
    super(state, deps, (state) => state);
  }
}
