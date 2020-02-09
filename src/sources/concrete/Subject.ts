import { Store } from '../abstract/Store';
import { Source, StateMap } from '../types';

export class Subject<S, T = S> extends Store<S, T> implements Source<T> {
  public constructor(state: S, map: StateMap<S, T>) {
    super(state, null, map);
  }
  public next(state: Partial<S>): void {
    return super.next(state);
  }
}

export class PureSubject<T> extends Subject<T, T> implements Source<T> {
  public constructor(state: T) {
    super(state, (state) => state);
  }
}
