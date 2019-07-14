import { TFu, TFn } from '~/types';
import { fu } from '~/abstracts';
import { map } from 'rxjs/operators';
import { createMap } from '~/utils';

export default withField;

function withField<A extends object, B extends object>(
  initial: TFn<A, B>
): TFu<A, A & B>;
function withField<A extends object, B, K extends string>(
  key: K,
  initial: TFn<A, B>
): TFu<A, A & { [P in K]: B }>;

function withField<A extends object, B extends object, K extends string>(
  a: K | TFn<A, B>,
  b?: TFn<A, B>
): TFu<A, A & (B | ({ [P in K]: B }))> {
  const hasKey = typeof a === 'string';
  const key = hasKey ? (a as K) : null;
  const initial = (hasKey ? b : a) as TFn<A, B>;
  const mapper = createMap(key);

  return fu(({ subscriber, collect }) => {
    const fields = initial(collect(), collect);

    return {
      initial: mapper(collect(), fields),
      subscriber: subscriber.pipe(map((a) => mapper(a, fields)))
    };
  });
}
