import { fu } from '~/abstracts';
import { TFu, TUpdatePolicy } from '~/types';
import { map } from 'rxjs/operators';
import { mapTo, initializePolicy } from '~/utils';

export type TCompute<A, B> = (self: A) => B;

export default withComputed;

function withComputed<A extends object, B extends object>(
  compute: TCompute<A, B>
): TFu<A, A & B>;
function withComputed<A extends object, B extends object>(
  policy: TUpdatePolicy<A>,
  compute: TCompute<A, B>
): TFu<A, A & B>;
function withComputed<A extends object, B, K extends string>(
  key: K,
  compute: TCompute<A, B>
): TFu<A, A & { [P in K]: B }>;
function withComputed<A extends object, B, K extends string>(
  key: K,
  policy: TUpdatePolicy<A>,
  compute: TCompute<A, B>
): TFu<A, A & { [P in K]: B }>;

function withComputed<A extends object, B, K extends string>(
  a: TCompute<A, B> | TUpdatePolicy<A> | K,
  b?: TCompute<A, B> | TUpdatePolicy<A>,
  c?: TCompute<A, B>
): TFu<A, A & (B | { [P in K]: B })> {
  const hasKey = typeof a === 'string';
  const hasPolicy = hasKey ? c !== undefined : b !== undefined;
  const key = hasKey ? (a as K) : null;
  const policy = (hasPolicy ? (hasKey ? b : a) : false) as TUpdatePolicy<A>;
  const compute = (hasKey
    ? hasPolicy
      ? c
      : b
    : hasPolicy
    ? b
    : a) as TCompute<A, B>;
  const mapper = mapTo(key);

  return fu((instance) => {
    const enactPolicy = initializePolicy(policy, compute);
    return {
      initial: mapper(instance.initial, enactPolicy(instance.initial)),
      subscriber: instance.subscriber.pipe(
        map((a) => mapper(a, enactPolicy(a)))
      )
    };
  });
}
