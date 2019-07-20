import { createCache } from '~/utils';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { TIntermediate, IFuseInstance, TUnion, TCollect } from '~/types';

export default function consolidate<A extends object, B extends object | void>(
  intermediate: TIntermediate<A, B>
): { collect: TCollect<TUnion<A, B>>; instance: IFuseInstance<TUnion<A, B>> } {
  const [instance, { execute, subscriber, teardown }] = intermediate;

  const a = instance.initial;
  const b = execute(a, 'initial');
  const parent = createCache(a);
  const union = createCache((b ? { ...a, ...b } : a) as TUnion<A, B>);
  const signal = [true];

  return {
    collect: union.collect,
    instance: {
      initial: union.collect(),
      subscriber: subscriber
        ? merge(instance.subscriber, subscriber.pipe(map(() => signal))).pipe(
            map((self) => {
              const a =
                self === signal ? parent.collect() : parent.set(self as A);
              const b = execute(a, self === signal ? 'emit' : 'next');
              const value = (b ? { ...a, ...b } : a) as TUnion<A, B>;
              return union.set(value);
            })
          )
        : instance.subscriber.pipe(
            map((a) => {
              const b = execute(a, 'next');
              const value = (b ? { ...a, ...b } : a) as TUnion<A, B>;
              return union.set(value);
            })
          ),
      teardown: teardown
        ? () => {
            instance.teardown();
            teardown();
          }
        : instance.teardown
    }
  };
}
