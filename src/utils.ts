import { shallowEqual } from 'shallow-equal-object';
import { Observable, OperatorFunction, merge, of } from 'rxjs';
import { pairwise, filter, map } from 'rxjs/operators';

export const shallow = shallowEqual;

export function compute<I, O>(deps: () => I, fn: (deps: I) => O): () => O {
  let lastDependencies: null | I = null;
  let lastResult: any = null;

  return () => {
    if (!lastDependencies) {
      lastDependencies = deps();
      lastResult = fn(lastDependencies);
      return lastResult;
    }

    const dependencies = deps();
    const isSame = shallow(dependencies, lastDependencies);
    if (isSame) return lastResult;

    lastDependencies = dependencies;
    lastResult = fn(lastDependencies);

    return lastResult;
  };
}

export function select<T, U>(fn: (value: T) => U): OperatorFunction<T, U> {
  return (observable: Observable<T>): Observable<U> => {
    const none = {};
    return merge(of(none), observable.pipe(map(fn))).pipe(
      pairwise(),
      filter(([previous, current]) => {
        if (previous === none) return true;
        return !shallow(previous, current);
      }),
      map((arr) => arr[1] as U)
    );
  };
}
