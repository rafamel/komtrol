import { Observable, combineLatest } from 'rxjs';
import { map as _map } from 'rxjs/operators';

export default function combine<A extends object, B, C extends A>(
  initials: [A, B],
  subscribers: [Observable<A>, Observable<B>],
  map: (a: A, b: B) => C
): { initial: C; subscriber: Observable<C> } {
  return {
    initial: map(initials[0], initials[1]),
    subscriber: combineLatest(subscribers[0], subscribers[1]).pipe(
      _map(([a, b]) => map(a, b))
    )
  };
}
