import { TFu, TUpdatePolicy, fu, createMap, createMemo, TFn } from 'komfu';
import { toStream } from 'mobx-utils';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export default withMobx;

function withMobx<A extends object, B extends object>(
  compute: TFn<A, B>
): TFu<A, A & B>;
function withMobx<A extends object, B extends object>(
  policy: TUpdatePolicy<A>,
  compute: TFn<A, B>
): TFu<A, A & B>;
function withMobx<A extends object, B, K extends string>(
  key: K,
  compute: TFn<A, B>
): TFu<A, A & { [P in K]: B }>;
function withMobx<A extends object, B, K extends string>(
  key: K,
  policy: TUpdatePolicy<A>,
  compute: TFn<A, B>
): TFu<A, A & { [P in K]: B }>;

function withMobx<A extends object, B, K extends string>(
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
    const stream = toStream<[number, B]>(() => {
      return [Date.now(), compute(collect(), collect)];
    });
    const memo = createMemo<A, [number, B]>(policy, (self) => {
      return [Date.now(), compute(self, collect)];
    });

    const subject = new BehaviorSubject(memo(collect()));
    const subscription = stream.subscribe((value) => subject.next(value));
    return {
      initial: mapper(collect(), subject.value[1]),
      subscriber: policy
        ? combineLatest(
            subscriber.pipe(map((a): [A, [number, B]] => [a, memo(a)])),
            subject
          ).pipe(
            map(([[a, bSync], bMobx]) =>
              mapper(a, bMobx[0] > bSync[0] ? bMobx[1] : bSync[1])
            )
          )
        : combineLatest(subscriber, subject).pipe(
            map(([a, b]) => mapper(a, b[1]))
          ),
      teardown: subscription.unsubscribe
    };
  });
}
