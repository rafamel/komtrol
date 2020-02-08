import { Observable, merge, of } from 'rxjs';
import { map, pairwise, filter } from 'rxjs/operators';
import { shallow } from '../utils';

export class Source<T = any> {
  public static select<T, U>(
    source: Source<T>,
    fn: (value: T) => U
  ): Source<U> {
    const initial: U = fn(source.data());
    const observable: Observable<U> = merge(
      of(initial),
      source.$.pipe(map(fn))
    ).pipe(
      pairwise(),
      filter(([previous, current]) => !shallow(previous, current)),
      map((arr) => arr[1])
    );

    return new Source(
      () => fn(source.data()),
      () => observable
    );
  }
  private internal: { data: () => T; observable: () => Observable<T> };
  public constructor(data: () => T, observable: () => Observable<T>) {
    this.internal = { data, observable };
  }
  public get $(): Observable<T> {
    return this.internal.observable();
  }
  public data = (): T => this.internal.data();
}
