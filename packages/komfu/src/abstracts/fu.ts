import { TFu, IFuInstance, IParentInstance } from '~/types';
import { tap } from 'rxjs/operators';
import { createCache } from '~/utils';

export default function fu<A extends object, B extends object>(
  initialize: (instance: IParentInstance<A>) => IFuInstance<B>
): TFu<A, B> {
  return (parent) => {
    const cache = createCache(parent.initial);
    const subscriber = parent.subscriber.pipe(tap(cache.set));
    const instance = initialize({
      subscriber,
      collect: cache.collect
    });

    const teardown = instance.teardown;
    return {
      ...instance,
      teardown: teardown
        ? () => {
            parent.teardown();
            teardown();
          }
        : parent.teardown
    };
  };
}
