import { fu } from '~/abstracts';
import { TFu } from '~/types';

export default function lift<A extends object, B extends A>(
  fn: (self: A) => TFu<A, B>
): TFu<A, B> {
  return fu((instance) => {
    return fn(instance.initial)(instance);
  });
}
