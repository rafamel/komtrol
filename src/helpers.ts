export function compute<I extends any[], O>(
  deps: () => I,
  fn: (...deps: I) => O
): () => O {
  let lastDependencies: null | I = null;
  let lastResult: any = null;

  return () => {
    if (!lastDependencies) {
      lastDependencies = deps();
      lastResult = fn(...lastDependencies);
      return lastResult;
    }

    const dependencies = deps();
    if (dependencies.length === lastDependencies.length) {
      let isSame = true;
      for (let i = 0; i < dependencies.length; i++) {
        if (dependencies[i] !== lastDependencies[i]) {
          isSame = false;
          break;
        }
      }
      if (isSame) return lastResult;
    }

    lastDependencies = dependencies;
    lastResult = fn(...lastDependencies);

    return lastResult;
  };
}
