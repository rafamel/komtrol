import fu from '~/fu';
import { TFu } from '~/types';
import { map } from 'rxjs/operators';

export default function withField<A, B, K extends string>(
  key: K,
  field: B
): TFu<A, A & { [P in K]: B }> {
  return fu((instance) => ({
    initial: { ...instance.initial, [key]: field } as any,
    subscriber: instance.subscriber.pipe(
      map((a) => ({ ...a, [key]: field } as any))
    )
  }));
}
