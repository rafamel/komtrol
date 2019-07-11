import fu from '~/fu';
import { TFu } from '~/types';
import { map } from 'rxjs/operators';
import lift from '~/lift';

export default function withFields<A, B extends object>(
  fields: B | ((self: A) => B)
): TFu<A, A & B> {
  function trunk(value: B): TFu<A, A & B> {
    return fu((instance) => {
      return {
        initial: { ...instance.initial, ...value },
        subscriber: instance.subscriber.pipe(map((a) => ({ ...a, ...value })))
      };
    });
  }

  return typeof fields === 'function'
    ? lift((self) => trunk((fields as any)(self)) as any)
    : trunk(fields);
}
