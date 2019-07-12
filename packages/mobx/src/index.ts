import {
  mapTo,
  TFu,
  TUpdatePolicy,
  fu,
  initializePolicy,
  connect,
  lift
} from 'komfu';
import { toStream } from 'mobx-utils';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export type TMobxCompute<A, B> = (self: A) => B;

export default withMobx;

function withMobx<A extends object, B extends object>(
  compute: TMobxCompute<A, B>
): TFu<A, A & B>;
function withMobx<A extends object, B extends object>(
  policy: TUpdatePolicy<A>,
  compute: TMobxCompute<A, B>
): TFu<A, A & B>;
function withMobx<A extends object, B, K extends string>(
  key: K,
  compute: TMobxCompute<A, B>
): TFu<A, A & { [P in K]: B }>;
function withMobx<A extends object, B, K extends string>(
  key: K,
  policy: TUpdatePolicy<A>,
  compute: TMobxCompute<A, B>
): TFu<A, A & { [P in K]: B }>;

function withMobx<A extends object, B, K extends string>(
  a: TMobxCompute<A, B> | TUpdatePolicy<A> | K,
  b?: TMobxCompute<A, B> | TUpdatePolicy<A>,
  c?: TMobxCompute<A, B>
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
    : a) as TMobxCompute<A, B>;
  const mapper = mapTo(key);

  const wrap = policy ? connect : lift;

  return wrap((self) => {
    return fu((instance) => {
      let lastMobx = false;

      const stream = toStream(() => {
        lastMobx = true;
        return compute(self);
      });
      const enactPolicy = initializePolicy(policy, (self) => {
        lastMobx = false;
        return compute(self);
      });

      const subject = new BehaviorSubject(enactPolicy(instance.initial));
      const subscription = stream.subscribe((value) => subject.next(value));
      return {
        initial: mapper(instance.initial, subject.value),
        subscriber: policy
          ? combineLatest(
              instance.subscriber.pipe(map((a): [A, B] => [a, enactPolicy(a)])),
              subject
            ).pipe(
              map(([[a, bSync], bMobx]) => mapper(a, lastMobx ? bMobx : bSync))
            )
          : combineLatest(instance.subscriber, subject).pipe(
              map(([a, b]) => mapper(a, b))
            ),
        teardown: subscription.unsubscribe
      };
    });
  });
}
