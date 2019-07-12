import fu from './fu';
import { TFu, IFuInstanceExtend } from '~/types';
import { combine } from '~/utils';

export default function extend<A extends object, B, C extends A = A & B>(
  initialize: (self: A) => IFuInstanceExtend<A, B, C>
): TFu<A, C> {
  return fu(({ initial, subscriber }) => {
    const { map, ...instance } = initialize(initial);

    const mapper = map || ((a: A, b: B): C => ({ ...a, ...b } as any));
    return {
      ...instance,
      ...combine(
        [initial, instance.initial],
        [subscriber, instance.subscriber],
        mapper
      )
    };
  });
}
