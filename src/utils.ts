import { shallowEqual as shallow } from 'shallow-equal-object';

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
