import { stateful, mapTo, TFu } from 'komfu';
import { toStream } from 'mobx-utils';

export default withMobx;

function withMobx<A extends object, B extends object>(
  fn: () => B
): TFu<A, A & B>;
function withMobx<A extends object, B, K extends string>(
  key: K,
  fn: () => B
): TFu<A, A & { [P in K]: B }>;

function withMobx<A extends object, B, K extends string>(
  a: K | (() => B),
  b?: () => B
): TFu<A, A & (B | { [P in K]: B })> {
  const hasKey = typeof a === 'string';
  const key = hasKey ? (a as K) : null;
  const fn = (hasKey ? b : a) as (() => B);
  const mapper = mapTo<A, B, K>(key);

  return stateful(fn, (stateful) => {
    const stream = toStream(fn);
    const subscription = stream.subscribe((value) => stateful.set(value));
    return {
      map: mapper,
      teardown: subscription.unsubscribe
    };
  });
}
