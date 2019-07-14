import { fu } from '~/abstracts';
import { TFu, TFn } from '~/types';

export default function lift<A extends object, B extends A>(
  provider: TFn<A, TFu<A, B>>
): TFu<A, B> {
  return fu(({ subscriber, collect }) => {
    const initial = collect();
    return provider(initial, collect)({
      initial,
      subscriber,
      teardown: () => {}
    });
  });
}
