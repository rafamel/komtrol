import { Source } from '../definitions';
import { Members } from 'type-core';
import { Push } from 'multitude/definitions';
import { combine } from 'multitude/push';
import { shallow } from 'equal-strategies';

export type SourceRecord<T extends Source<any> = Source<any>> = Record<any, T>;

export type SourceRecordStates<T extends SourceRecord> = {
  [P in keyof T]: T[P]['state'];
};

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

export function states<T extends Members<Source>>(
  sources: T
): SourceRecordStates<T> {
  return Object.entries(sources).reduce((acc: any, [key, value]) => {
    acc[key] = value.state;
    return acc;
  }, {});
}

export function states$<T extends Members<Source>>(
  sources: T
): Push.Observable<SourceRecordStates<T>> {
  const states = Object.entries(sources).reduce((acc: any, [key, value]) => {
    acc[key] = value.state$;
    return acc;
  }, {});

  return combine(states) as Push.Observable<SourceRecordStates<T>>;
}
