import { shallowEqual as shallow } from 'shallow-equal-object';
import { Source, Operation } from './sources';
import { Observable, merge, of } from 'rxjs';

export type Operations = { [P in OperationStatic]: typeof Operation[P] };
export type OperationStatic = Exclude<keyof typeof Operation, 'prototype'>;

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

export function operation<T>(
  fn: (operations: Operations) => Operation<T>
): Observable<T> {
  const operations: Operations = {
    combine: Operation.combine.bind(Operation),
    select: Operation.select.bind(Operation)
  };
  return new Observable<T>((obs) => {
    const operation = fn(operations);
    const subscription = merge(of(operation.state), operation.state$).subscribe(
      {
        next: (value) => obs.next(value),
        error(err) {
          obs.error(err);
          operation.teardown();
        },
        complete() {
          obs.complete();
          operation.teardown();
        }
      }
    );
    return () => {
      subscription.unsubscribe();
      operation.teardown();
    };
  });
}

export function match<T>(
  source: Source<T>,
  state: Partial<T>,
  debounce?: number | null
): Observable<boolean> {
  const keys: null | Array<keyof T> =
    typeof state === 'object' && state !== null
      ? (Object.keys(state) as Array<keyof T>)
      : null;

  const isMatch = (value: T): boolean => {
    const equal = value === state;
    if (!keys) return equal;
    if (equal) return true;

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

          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }

          if (value === last) return;

          next = value;
          timeout = setTimeout(() => {
            next = null;
            last = value;
            obs.next(value);
          }, Math.max(0, debounce));
        }
      },
      error(err) {
        if (timeout) clearTimeout(timeout);
        obs.error(err);
      },
      complete() {
        if (timeout) clearTimeout(timeout);
        obs.complete();
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  });
}
