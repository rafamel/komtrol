import { fu } from '~/abstracts';
import { TFu } from '~/types';
import { map } from 'rxjs/operators';
import { shallowEqualProps as equal } from 'shallow-equal-props';
import { mapTo } from '~/utils';

export type TCompute<A, B, D> = (deps: D, self: A) => B;

export default withComputed;

function withComputed<A extends object, B extends object>(
  compute: TCompute<A, B, A>
): TFu<A, A & B>;
function withComputed<A extends object, B extends object>(
  dependencies: null,
  compute: TCompute<A, B, null>
): TFu<A, A & B>;
function withComputed<A extends object, B extends object, D extends object>(
  dependencies: (self: A) => D,
  compute: TCompute<A, B, D>
): TFu<A, A & B>;
function withComputed<A extends object, B, K extends string>(
  key: K,
  compute: TCompute<A, B, A>
): TFu<A, A & { [P in K]: B }>;
function withComputed<A extends object, B, K extends string>(
  key: K,
  dependencies: null,
  compute: TCompute<A, B, null>
): TFu<A, A & { [P in K]: B }>;
function withComputed<A extends object, B, D extends object, K extends string>(
  key: K,
  dependencies: (self: A) => D,
  compute: TCompute<A, B, D>
): TFu<A, A & { [P in K]: B }>;

function withComputed<A extends object, B, D extends object, K extends string>(
  a: TCompute<A, B, A> | null | ((self: A) => D) | K,
  b?: TCompute<A, B, null | A | D> | null | ((self: A) => D),
  c?: TCompute<A, B, null | D>
): TFu<A, A & (B | { [P in K]: B })> {
  const hasKey = typeof a === 'string';
  const hasDependencies = hasKey ? c !== undefined : b !== undefined;

  const key = hasKey ? (a as K) : null;
  let dependencies: undefined | null | ((self: A) => D);
  let compute: TCompute<A, B, A | null | D>;
  if (hasKey) {
    dependencies = hasDependencies ? (b as any) : undefined;
    compute = hasDependencies ? c : (b as any);
  } else {
    dependencies = hasDependencies ? (a as any) : undefined;
    compute = hasDependencies ? b : (a as any);
  }
  const mapper = mapTo(key);

  // dependencies is null; only execute on init
  if (hasDependencies && !dependencies) {
    return fu((instance) => {
      const current = compute(null, instance.initial);
      return {
        initial: mapper(instance.initial, current),
        subscriber: instance.subscriber.pipe(map((a) => mapper(a, current)))
      };
    });
  }

  // has actual dependencies
  if (hasDependencies) {
    return fu((instance) => {
      const doDependencies = dependencies as (self: A) => D;
      let lastDeps = doDependencies(instance.initial);
      let current = compute(lastDeps, instance.initial);

      return {
        initial: mapper(instance.initial, current),
        subscriber: instance.subscriber.pipe(
          map((a) => {
            const deps = doDependencies(a);

            if (!equal(deps, lastDeps)) {
              current = compute(deps, a);
              lastDeps = deps;
            }

            return mapper(a, current);
          })
        )
      };
    });
  }

  // doesn't have dependencies; compute on each update
  return fu((instance) => ({
    initial: mapper(
      instance.initial,
      compute(instance.initial, instance.initial)
    ),
    subscriber: instance.subscriber.pipe(map((a) => mapper(a, compute(a, a))))
  }));
}
