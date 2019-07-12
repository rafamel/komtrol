import { fu } from '~/abstracts';
import { TFu } from '~/types';
import { map as _map } from 'rxjs/operators';

export default withMap;

function withMap<A extends object, B extends object>(
  map: (self: A) => B
): TFu<A, B>;
function withMap<A extends object, B, K extends keyof A>(
  key: K,
  map: (item: A[K]) => B
): TFu<A, Pick<A, Exclude<keyof A, K>> & { [P in K]: B }>;

function withMap<A extends object, B extends object, K extends keyof A>(
  a: K | ((self: A) => B),
  b?: (self: A[K]) => B
): TFu<A, B | (Pick<A, Exclude<keyof A, K>> & { [P in K]: B })> {
  const hasKey = typeof a === 'string';
  const key = hasKey ? (a as K) : null;
  const map = (hasKey ? b : a) as ((self: A | A[K]) => B);
  const mapper =
    key === null
      ? (map as ((self: A) => B))
      : (a: A) =>
          ({
            ...a,
            [key]: map(a[key])
          } as Pick<A, Exclude<keyof A, K>> & { [P in K]: B });

  return fu((instance) => ({
    initial: mapper(instance.initial),
    subscriber: instance.subscriber.pipe(_map((a) => mapper(a)))
  }));
}
