import { fu } from '~/abstracts';
import { TFu } from '~/types';
import { map } from 'rxjs/operators';
import { shallowEqualProps as equal } from 'shallow-equal-props';

export type TEffect<A, T> = (deps: T, self: A) => void | (() => void);

export default withEffect;

function withEffect<A extends object>(effect: TEffect<A, A>): TFu<A, A>;
function withEffect<A extends object>(
  dependencies: null,
  effect: TEffect<A, null>
): TFu<A, A>;
function withEffect<A extends object, D extends object>(
  dependencies: (self: A) => D,
  effect: TEffect<A, D>
): TFu<A, A>;

function withEffect<A extends object, D extends object>(
  a: TEffect<A, A> | null | ((self: A) => D),
  b?: TEffect<A, null> | TEffect<A, D>
): TFu<A, A> {
  const hasDependencies = typeof b === 'function';
  const dependencies = hasDependencies ? (a as (self: A) => D) : null;
  const effect = hasDependencies
    ? (b as TEffect<A, null | D>)
    : (a as TEffect<A, A>);

  // dependencies is null; only execute on init
  if (hasDependencies && !dependencies) {
    return fu((instance) => {
      const doEffect = effect as TEffect<A, null>;
      let teardown = doEffect(null, instance.initial);
      return {
        teardown() {
          if (teardown) {
            teardown();
            teardown = undefined;
          }
        }
      };
    });
  }

  // has actual dependencies
  if (hasDependencies) {
    return fu((instance) => {
      const doDependencies = dependencies as (self: A) => D;
      const doEffect = effect as TEffect<A, D>;
      let lastDeps = doDependencies(instance.initial);
      let teardown = doEffect(lastDeps, instance.initial);

      return {
        subscriber: instance.subscriber.pipe(
          map((a) => {
            const deps = doDependencies(a);

            if (!equal(deps, lastDeps)) {
              if (teardown) teardown();
              teardown = doEffect(deps, a);
              lastDeps = deps;
            }

            return a;
          })
        ),
        teardown() {
          if (teardown) {
            teardown();
            teardown = undefined;
          }
        }
      };
    });
  }

  // doesn't have dependencies; execute on each update
  return fu((instance) => {
    const doEffect = effect as TEffect<A, A>;
    let teardown = doEffect(instance.initial, instance.initial);

    return {
      subscriber: instance.subscriber.pipe(
        map((a) => {
          if (teardown) teardown();
          teardown = doEffect(a, a);
          return a;
        })
      ),
      teardown() {
        if (teardown) {
          teardown();
          teardown = undefined;
        }
      }
    };
  });
}
