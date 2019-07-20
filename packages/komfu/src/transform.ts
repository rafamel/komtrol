import { TTransform, IFuseProviderInstance, TCollect } from '~/types';
import { createCache } from '~/utils';
import { tap } from 'rxjs/operators';

export default function transform<A extends object, B, T>(
  fn: (
    provider: IFuseProviderInstance<A, B>,
    collect: TCollect<A>
  ) => IFuseProviderInstance<A, T>
): TTransform<A, B, T> {
  return ([a, b]) => {
    const cache = createCache(a.initial);
    return [
      { ...a, subscriber: a.subscriber.pipe(tap(cache.set)) },
      fn(b, cache.collect)
    ];
  };
}
