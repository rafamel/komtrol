import { fu } from '~/abstracts';
import { TFu, TUpdatePolicy, TFn } from '~/types';
import { tap } from 'rxjs/operators';
import { createMemo } from '~/utils';

/**
 * Takes a `effect` callback to be run on initialization and on each update for which `policy` is or returns `true`. See also `withAction` and `withCompute`.
 */
export default function withEffect<A extends object>(
  policy: TUpdatePolicy<A>,
  effect: TFn<A, void | (() => void)>
): TFu<A, A> {
  return fu(({ subscriber, collect }) => {
    let teardown: void | (() => void);
    const memo = createMemo(policy, (self) => {
      if (teardown) teardown();
      teardown = effect(self, collect);
    });

    memo(collect());
    return {
      initial: collect(),
      subscriber: subscriber.pipe(tap(memo)),
      teardown() {
        if (teardown) {
          teardown();
          teardown = undefined;
        }
      }
    };
  });
}
