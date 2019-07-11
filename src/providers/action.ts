import { fu } from '~/abstracts';
import { TFu } from '~/types';
import { map } from 'rxjs/operators';
import lift from '../lift';
import { mapTo } from '~/utils';

export default withAction;

function withAction<A extends object, B extends object>(
  actions: (self: A) => B
): TFu<A, A & B>;
function withAction<A extends object, B, K extends string>(
  key: K,
  action: (self: A) => B
): TFu<A, A & { [P in K]: B }>;

function withAction<A extends object, B, K extends string>(
  a: K | ((self: A) => B),
  b?: (self: A) => B
): TFu<A, A & (B | { [P in K]: B })> {
  const hasKey = typeof a === 'string';
  const key = hasKey ? (a as K) : null;
  const field = (hasKey ? b : a) as ((self: A) => B);
  const mapper = mapTo(key);

  function trunk(value: B): TFu<A, A & (B | { [P in K]: B })> {
    return fu((instance) => {
      return {
        initial: mapper(instance.initial, value),
        subscriber: instance.subscriber.pipe(map((a) => mapper(a, value)))
      };
    });
  }

  return lift((self) => trunk(field(self)));
}
