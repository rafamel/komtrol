import { shallowEqual as shallow } from 'shallow-equal-object';
import { Source } from './sources';
import { Observable, merge, of } from 'rxjs';

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

export function match<T>(
  source: Source<T>,
  state: Partial<T>,
  debounce?: number
): Observable<boolean> {
  const keys: null | Array<keyof T> =
    typeof state === 'object' && state !== null
      ? (Object.keys(state) as Array<keyof T>)
      : null;

  const isMatch = (value: T): boolean => {
    if (!keys) return value === state;

    for (const key of keys) {
      if (state[key] !== value[key]) return false;
    }
    return true;
  };

  return new Observable<boolean>((obs) => {
    let last: null | boolean = null;
    let next: null | boolean = null;
    let timeout: null | NodeJS.Timeout = null;

    const subscription = merge(of(source.state), source.state$).subscribe({
      next(state) {
        const value = isMatch(state);

        if (!debounce && debounce !== 0) {
          if (value === last) return;
          last = value;
          return obs.next(value);
        } else {
          if (value === next) return;
          if (timeout) clearTimeout(timeout);
          if (value === last) return;

          next = value;
          timeout = setTimeout(() => {
            next = null;
            last = value;
            obs.next(value);
          }, debounce);
        }
      },
      error: (err) => obs.error(err),
      complete: () => obs.complete()
    });

    return () => {
      subscription.unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  });
}
