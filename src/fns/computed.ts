import fu from '~/fu';
import { TFu } from '~/types';
import { map } from 'rxjs/operators';
import { shallowEqualProps as equal } from 'shallow-equal-props';

export default withComputed;

function withComputed<A, B extends object, D extends object>(
  dependencies: (self: A) => D,
  compute: (deps: D, self: A) => B
): TFu<A, A & B>;
function withComputed<A, B, D extends object, K extends string>(
  key: K,
  dependencies: (self: A) => D,
  compute: (deps: D, self: A) => B
): TFu<A, A & { [P in K]: B }>;

function withComputed<A, B, D extends object, K extends string>(
  a: K | ((self: A) => D),
  b: ((deps: D, self: A) => B) | ((self: A) => D),
  c?: (deps: D, self: A) => B
): TFu<A, A & (B | { [P in K]: B })> {
  return fu((instance) => {
    const hasKey = typeof a === 'string';
    const key = hasKey ? (a as K) : null;
    const dependencies = (hasKey ? b : a) as (self: A) => D;
    const compute = (hasKey ? c : b) as (deps: D, self: A) => B;

    let lastDeps = dependencies(instance.initial);
    let current = compute(lastDeps, instance.initial);

    const mapping = hasKey
      ? (a: A, b: B) => ({ ...a, [key as K]: b } as A & { [P in K]: B })
      : (a: A, b: B) => ({ ...a, ...b });

    return {
      initial: mapping(instance.initial, current),
      subscriber: instance.subscriber.pipe(
        map((a) => {
          const deps = dependencies(a);

          if (!equal(deps, lastDeps)) {
            current = compute(deps, a);
            lastDeps = deps;
          }

          return mapping(a, current);
        })
      )
    };
  });
}
