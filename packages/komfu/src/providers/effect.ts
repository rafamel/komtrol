import { TFu, TFn, TUpdatePolicy } from '~/types';
import { fu } from '~/abstracts';
import pipe from '~/pipe';
import { memo } from '~/transforms';

export default withEffect;

/* Declarations */
function withEffect<A extends object, B extends object | void>(
  effect: TFn<A, B, void | (() => void)>
): TFu<A, B, void>;
function withEffect<A extends object, B extends object | void>(
  policy: TUpdatePolicy<A, B>,
  effect: TFn<A, B, void | (() => void)>
): TFu<A, B, void>;

/* Implementation */
function withEffect(a: any, b?: any): any {
  return b === undefined
    ? pipe.f(trunk(a), memo(false))
    : pipe.f(trunk(b), memo(a));
}

export function trunk<A extends object, B extends object | void>(
  effect: TFn<A, B, void | (() => void)>
): TFu<A, B, void> {
  return fu((collect) => {
    let queue: Array<() => void> = [];
    let immediate: void | NodeJS.Immediate;
    let teardown: void | (() => void);

    function next(): void {
      const fn = queue.shift();
      if (!fn) return;

      immediate = setImmediate(() => {
        fn();
        immediate = setImmediate(() => {
          next();
          immediate = undefined;
        });
      });
    }

    return {
      execute: () => {
        queue.push(() => {
          if (teardown) teardown();
          teardown = effect(collect(), collect);
        });

        if (!immediate) next();
      },
      teardown() {
        if (immediate) clearImmediate(immediate);
        immediate = setImmediate(() => {
          if (teardown) teardown();
          queue = [];
          teardown = undefined;
          immediate = undefined;
        });
      }
    };
  });
}
