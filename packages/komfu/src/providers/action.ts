import { fu } from '~/abstracts';
import { TFu, TFn } from '~/types';

/**
 * Takes a callback to be run on initialization, optionally returning a teardown function. It's a specialized version of `withEffect`, which might be used to make it explicit its callback is only intended to be run once.
 */
export default function withAction<A extends object>(
  action: TFn<A, void | (() => void)>
): TFu<A, A> {
  return fu(({ subscriber, collect }) => {
    const teardown = action(collect(), collect);

    return {
      initial: collect(),
      subscriber: subscriber,
      teardown: teardown || (() => {})
    };
  });
}
