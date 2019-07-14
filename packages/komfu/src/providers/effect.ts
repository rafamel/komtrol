import { fu } from '~/abstracts';
import { TFu, TUpdatePolicy, TFn } from '~/types';
import { tap } from 'rxjs/operators';
import { createMemo } from '~/utils';

export type TEffect<A> = TFn<A, void | (() => void)>;

export default withEffect;

function withEffect<A extends object>(effect: TEffect<A>): TFu<A, A>;
function withEffect<A extends object>(
  policy: TUpdatePolicy<A>,
  effect: TEffect<A>
): TFu<A, A>;

function withEffect<A extends object>(
  a: TEffect<A> | TUpdatePolicy<A>,
  b?: TEffect<A>
): TFu<A, A> {
  const hasPolicy = b !== undefined;
  const effect = (hasPolicy ? b : a) as TEffect<A>;
  const policy = (hasPolicy ? a : false) as TUpdatePolicy<A>;

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
