import { Observable } from 'rxjs';
import { Enclosure } from '../abstract/Enclosure';
import { Source, EmptyUnion } from '../types';

export abstract class Store<S, T = S, D = EmptyUnion> extends Enclosure<S, T, D>
  implements Source<T> {
  public get state(): T {
    return super.state;
  }
  public get state$(): Observable<T> {
    return super.state$;
  }
}

export abstract class PureStore<T, D = EmptyUnion> extends Store<T, T, D>
  implements Source<T> {
  public constructor(state: T, dependencies: D) {
    super(state, dependencies, (state) => state);
  }
}
