import { fu } from '~/abstracts';
import { TFu, TUpdatePolicy, TFn } from '~/types';
import { map } from 'rxjs/operators';
import { createMap, createMemo } from '~/utils';

export default withComputed;

function withComputed<A extends object, B extends object>(
  compute: TFn<A, B>
): TFu<A, A & B>;
function withComputed<A extends object, B extends object>(
  policy: TUpdatePolicy<A>,
  compute: TFn<A, B>
): TFu<A, A & B>;
function withComputed<A extends object, B, K extends string>(
  key: K,
  compute: TFn<A, B>
): TFu<A, A & { [P in K]: B }>;
function withComputed<A extends object, B, K extends string>(
  key: K,
  policy: TUpdatePolicy<A>,
  compute: TFn<A, B>
): TFu<A, A & { [P in K]: B }>;

function withComputed<A extends object, B, K extends string>(
  a: TFn<A, B> | TUpdatePolicy<A> | K,
  b?: TFn<A, B> | TUpdatePolicy<A>,
  c?: TFn<A, B>
): TFu<A, A & (B | { [P in K]: B })> {
  const hasKey = typeof a === 'string';
  const hasPolicy = hasKey ? c !== undefined : b !== undefined;
  const key = hasKey ? (a as K) : null;
  const policy = (hasPolicy ? (hasKey ? b : a) : false) as TUpdatePolicy<A>;
  const compute = (hasKey ? (hasPolicy ? c : b) : hasPolicy ? b : a) as TFn<
    A,
    B
  >;
  const mapper = createMap(key);

  return fu(({ subscriber, collect }) => {
    const memo = createMemo(policy, (self) => compute(self, collect));
    return {
      initial: mapper(collect(), memo(collect())),
      subscriber: subscriber.pipe(map((a) => mapper(a, memo(a))))
    };
  });
}
