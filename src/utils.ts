import { shallowEqual as shallow } from 'shallow-equal-object';

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
