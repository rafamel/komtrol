import fu from '~/fu';
import { TFu } from '~/types';
import { map } from 'rxjs/operators';
import { shallowEqualProps as equal } from 'shallow-equal-props';

export default function withComputed<A, T, D extends object, K extends string>(
  key: K,
  dependencies: (self: A) => D,
  compute: (deps: D, self: A) => T
): TFu<A, A & { [P in K]: T }> {
  return fu((instance) => {
    let lastDeps = dependencies(instance.initial);
    let current = compute(lastDeps, instance.initial);

    return {
      initial: { ...instance.initial, [key]: current } as any,
      subscriber: instance.subscriber.pipe(
        map((a) => {
          const deps = dependencies(a);

          if (!equal(deps, lastDeps)) {
            current = compute(deps, a);
            lastDeps = deps;
          }

          return { ...a, [key]: current } as any;
        })
      )
    };
  });
}
