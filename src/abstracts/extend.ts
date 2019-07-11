import fu from './fu';
import { TFu, IFuInstanceExtend } from '~/types';
import { combineLatest } from 'rxjs';
import { map as _map } from 'rxjs/operators';

export default function extend<A, B, C extends A = A & B>(
  initialize: () => IFuInstanceExtend<A, B, C>
): TFu<A, C> {
  return fu(({ initial, subscriber }) => {
    const { map, ...instance } = initialize();

    const mapper = map || ((a: A, b: B): C => ({ ...a, ...b } as any));
    return {
      ...instance,
      initial: mapper(initial, instance.initial),
      subscriber: combineLatest(subscriber, instance.subscriber).pipe(
        _map(([a, b]) => mapper(a, b))
      )
    };
  });
}
