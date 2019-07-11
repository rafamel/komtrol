import { fu } from '~/abstracts';
import { TFu } from '~/types';
import { map } from 'rxjs/operators';
import lift from '~/lift';
import { mapTo } from '~/utils';

export default withField;

function withField<A extends object, B extends object>(
  fields: B | ((self: A) => B)
): TFu<A, A & B>;
function withField<A extends object, B, K extends string>(
  key: K,
  field: B | ((self: A) => B)
): TFu<A, A & { [P in K]: B }>;

function withField<A extends object, B, K extends string>(
  a: K | B | ((self: A) => B),
  b?: B | ((self: A) => B)
): TFu<A, A & (B | { [P in K]: B })> {
  const hasKey = typeof a === 'string';
  const key = hasKey ? (a as K) : null;
  const field = (hasKey ? b : a) as B | ((self: A) => B);
  const mapper = mapTo(key);

  function trunk(value: B): TFu<A, A & (B | { [P in K]: B })> {
    return fu((instance) => {
      return {
        initial: mapper(instance.initial, value),
        subscriber: instance.subscriber.pipe(map((a) => mapper(a, value)))
      };
    });
  }

  return isFieldFn(field) ? lift((self) => trunk(field(self))) : trunk(field);
}

export function isFieldFn<A, B>(
  field: B | ((self: A) => B)
): field is (self: A) => B {
  return typeof field === 'function';
}
