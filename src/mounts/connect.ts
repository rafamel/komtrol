import { fu } from '~/abstracts';
import { TFu } from '~/types';
import { tap } from 'rxjs/operators';

export default function connect<A extends object, B extends A>(
  fn: (self: A) => TFu<A, B>
): TFu<A, B> {
  return fu((instance) => {
    const self = Object.assign({}, instance.initial);

    return fn(self)({
      ...instance,
      subscriber: instance.subscriber.pipe(
        tap((current) => {
          const oldKeys = Object.keys(self) as Array<keyof A>;
          for (let key of oldKeys) {
            if (!current.hasOwnProperty(key)) {
              delete self[key];
            }
          }
          Object.assign(self, current);
        })
      )
    });
  });
}
