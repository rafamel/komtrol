import { Observable } from 'rxjs';
import { Enclosure } from '../abstract/Enclosure';
import { Source, EmptyUnion } from '../types';

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
