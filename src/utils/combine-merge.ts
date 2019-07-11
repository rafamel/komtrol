import { Observable, combineLatest } from 'rxjs';
import { map as _map } from 'rxjs/operators';

export default combineMerge;

function combineMerge<A, B extends object>(
  initials: [A, B],
  subscribers: [Observable<A>, Observable<B>]
): { initial: A & B; subscriber: Observable<A & B> };
function combineMerge<A, B, C extends A>(
  initials: [A, B],
  subscribers: [Observable<A>, Observable<B>],
  map: (a: A, b: B) => C
): { initial: C; subscriber: Observable<C> };

function combineMerge<A, B, C extends A>(
  initials: [A, B],
  subscribers: [Observable<A>, Observable<B>],
  map?: (a: A, b: B) => C
): { initial: (A & B) | C; subscriber: Observable<(A & B) | C> } {
  const mapper = map || ((a: A, b: B): A & B => ({ ...a, ...b }));

  return {
    initial: mapper(initials[0], initials[1]),
    subscriber: combineLatest(subscribers[0], subscribers[1]).pipe(
      _map(([a, b]) => mapper(a, b))
    )
  };
}
