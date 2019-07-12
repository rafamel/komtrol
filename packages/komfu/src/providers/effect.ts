import { fu } from '~/abstracts';
import { TFu, TUpdatePolicy } from '~/types';
import { map } from 'rxjs/operators';
import { initializePolicy } from '~/utils';

export type TEffect<A> = (self: A) => void | (() => void);

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

  return fu((instance) => {
    let teardown: void | (() => void);
    const enactPolicy = initializePolicy(policy, (self) => {
      if (teardown) teardown();
      teardown = effect(self);
    });

    enactPolicy(instance.initial);
    return {
      subscriber: instance.subscriber.pipe(
        map((a) => {
          enactPolicy(a);
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
