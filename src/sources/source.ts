import { Observable } from 'rxjs';
import { Enclosure } from './enclosure';
import { Source, EmptyUnion, StateMap } from './types';

/**
 * A `Source` implementation as an abstract class.
 */
export abstract class Resource<S, T = S, D = EmptyUnion>
  extends Enclosure<S, T, D>
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
export class SourceSubject<S, T = S> extends Resource<S, T>
  implements Source<T> {
  public constructor(state: S, map: StateMap<S, T>) {
    super(state, null, map);
  }
  public next(state: Partial<S>, compare?: boolean): void {
    return super.next(state, compare);
  }
}
