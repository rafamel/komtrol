import fu from './fu';
import { TFu, TFn, IExtendInstance } from '~/types';
import { combine } from '~/utils';

export default function extend<A extends object, B, C extends A = A & B>(
  initialize: TFn<A, IExtendInstance<A, B, C>>
): TFu<A, C> {
  return fu((parent) => {
    const { map, ...instance } = initialize(parent.collect(), parent.collect);

    const mapper = map || ((a: A, b: B): C => ({ ...a, ...b } as any));
    return combine(parent, instance, mapper);
  });
}
