import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export default function combineMerge<A, B>(
  initials: [A, B],
  subscribers: [Observable<A>, Observable<B>]
): { initial: A & B; subscriber: Observable<A & B> } {
  return {
    initial: { ...initials[0], ...initials[1] },
    subscriber: combineLatest(subscribers[0], subscribers[1]).pipe(
      map(([a, b]) => ({ ...a, ...b }))
    )
  };
}
