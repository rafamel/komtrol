import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { shallow } from 'equal-strategies';
import { SourceRecord, SourceRecordStates } from './types';

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
    const isSame = shallow(lastDependencies, dependencies);
    if (isSame) return lastResult;

    lastDependencies = dependencies;
    lastResult = fn(lastDependencies);

    return lastResult;
  };
}

export function states<T extends SourceRecord>(
  sources: T
): SourceRecordStates<T> {
  return Object.entries(sources).reduce(
    (acc, [key, value]) => Object.assign(acc, { [key]: value.state }),
    {} as any
  );
}

export function states$<T extends SourceRecord>(
  sources: T
): Observable<SourceRecordStates<T>> {
  const entries = Object.entries(sources);
  const observables = entries.map((items) => items[1].state$);

  return combineLatest(observables).pipe(
    map((arr) => {
      const states: any = {};
      for (let i = 0; i < arr.length; i++) {
        const [key] = entries[i];
        states[key] = arr[i];
      }
      return states;
    })
  );
}
