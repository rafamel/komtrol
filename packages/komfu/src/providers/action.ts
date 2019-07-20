import { TFu, TFn, TUpdatePolicy } from '~/types';
import { fu } from '~/abstracts';
import pipe from '~/pipe';
import { memo } from '~/transforms';

export default withAction;

/* Declarations */
function withAction<A extends object, B extends object | void>(
  effect: TFn<A, B, void | (() => void)>
): TFu<A, B, void>;
function withAction<A extends object, B extends object | void>(
  policy: TUpdatePolicy<A, B>,
  effect: TFn<A, B, void | (() => void)>
): TFu<A, B, void>;

/* Implementation */
function withAction(a: any, b?: any): any {
  return b === undefined
    ? pipe.f(trunk(a), memo(false))
    : pipe.f(trunk(b), memo(a));
}

export function trunk<A extends object, B extends object | void>(
  effect: TFn<A, B, void | (() => void)>
): TFu<A, B, void> {
  return fu((collect) => {
    let teardown: void | (() => void);
    return {
      execute: () => {
        if (teardown) teardown();
        teardown = effect(collect(), collect);
      },
      teardown() {
        if (teardown) teardown();
        teardown = undefined;
      }
    };
  });
}
