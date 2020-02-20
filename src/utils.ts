import { shallowEqual as shallow } from 'shallow-equal-object';
import { Source, Operation } from './sources';
import { Observable, merge, of } from 'rxjs';
import { filter } from 'rxjs/operators';

export type Operations = { [P in OperationStatic]: typeof Operation[P] };
export type OperationStatic = Exclude<keyof typeof Operation, 'prototype'>;

export interface MatchOptions {
  debounce?: number | null;
  only?: boolean | null;
}

/**
 * Simple last value memoization for `fn`.
 * If the values of a given object of dependencies provided by `deps`,
 * if they're shallow equal to the previously provided,
 * it will return `fn`'s last value without evaluating `fn` yet again.
 */
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

/**
 * Allows to create cold, self stopping, observables from `Operation`s.
 * As `fn` will be called on each subscription,
 * a new `Operation` instance will be created and, hence,
 * teared down on unsubscribe.
 * That implies the operation will be run independently
 * for each observable subscription, but also that it will be
 * terminated once the observable is no longer being consumed.
 * As an additional difference with `Operation.state$`,
 * the returned `Observable` will also emit its initial value
 * upon subscription.
 */
export function operation<T>(
  fn: (operations: Operations) => Operation<T, any>
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

/**
 * Given a `source` and a partial `state` object for it,
 * it will evaluate whether the values of `state`
 * match -are shallow equal- to those of the `source`'s state,
 * without taking into account non existing keys in the partial `state`.
 * It will return an `Observable` that emits match changes.
 * If `debounce` is set, it will wait until the `source`'s state matches
 * `state` without interruption for the given amount of milliseconds.
 */
export function match<T>(
  source: Source<T>,
  state: Partial<T>,
  options?: MatchOptions
): Observable<boolean> {
  const debounce = options && options.debounce;
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

  const observable = new Observable<boolean>((obs) => {
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

  return options && typeof options.only === 'boolean'
    ? observable.pipe(filter((value) => value === options.only))
    : observable;
}
