import { fu } from '~/abstracts';
import { TFu, TCollect, TFn } from '~/types';
import { map as _map } from 'rxjs/operators';

export default withMap;

function withMap<A extends object, B extends object>(map: TFn<A, B>): TFu<A, B>;
function withMap<A extends object, B, K extends keyof A>(
  key: K,
  map: TFn<A[K], B>
): TFu<A, Pick<A, Exclude<keyof A, K>> & { [P in K]: B }>;
function withMap<A extends object, B extends object, K extends keyof A>(
  a: K | TFn<A, B>,
  b?: TFn<A[K], B>
): TFu<A, B | (Pick<A, Exclude<keyof A, K>> & { [P in K]: B })> {
  const hasKey = typeof a === 'string';
  const key = hasKey ? (a as K) : null;
  const map = (hasKey ? b : a) as TFn<A | A[K], B>;
  const mapper =
    key === null
      ? (map as TFn<A, B>)
      : (a: A, collect: TCollect<A>) =>
          ({
            ...a,
            [key]: map(a[key], () => collect()[key])
          } as Pick<A, Exclude<keyof A, K>> & { [P in K]: B });

  return fu(({ subscriber, collect }) => {
    return {
      initial: mapper(collect(), collect),
      subscriber: subscriber.pipe(_map((a) => mapper(a, collect)))
    };
  });
}
