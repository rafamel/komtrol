import { TFu } from '~/types';
import { fu } from '~/abstracts';
import { map } from 'rxjs/operators';
import { mapTo } from '~/utils';

export default withField;

function withField<A extends object, B extends object>(
  initial: (self: A) => B
): TFu<A, A & B>;
function withField<A extends object, B, K extends string>(
  key: K,
  initial: (self: A) => B
): TFu<A, A & { [P in K]: B }>;

function withField<A extends object, B extends object, K extends string>(
  a: K | ((self: A) => B),
  b?: (self: A) => B
): TFu<A, A & (B | ({ [P in K]: B }))> {
  const hasKey = typeof a === 'string';
  const key = hasKey ? (a as K) : null;
  const initial = (hasKey ? b : a) as (self: A) => B;
  const mapper = mapTo(key);

  return fu((instance) => {
    const fields = initial(instance.initial);

    return {
      initial: mapper(instance.initial, fields),
      subscriber: instance.subscriber.pipe(map((a) => mapper(a, fields)))
    };
  });
}
