import { extend } from '~/abstracts';
import { TFu } from '~/types';
import { Observable, of, concat } from 'rxjs';
import { mapTo, isSelfFn } from '~/utils';

export default withObservable;

function withObservable<A extends object, B extends object>(
  initial: B | ((self: A) => B),
  observable: Observable<B> | ((self: A) => Observable<B>)
): TFu<A, A & B>;
function withObservable<A extends object, B, K extends string>(
  key: K,
  initial: B | ((self: A) => B),
  observable: Observable<B> | ((self: A) => Observable<B>)
): TFu<A, A & { [P in K]: B }>;

function withObservable<A extends object, B, K extends string>(
  a: B | ((self: A) => B) | K,
  b: B | ((self: A) => B) | Observable<B> | ((self: A) => Observable<B>),
  c?: Observable<B> | ((self: A) => Observable<B>)
): TFu<A, A & (B | { [P in K]: B })> {
  const hasKey = typeof a === 'string';
  const key = hasKey ? (a as K) : null;
  const initial = (hasKey ? b : a) as B | ((self: A) => B);
  const observable = (hasKey ? c : b) as
    | Observable<B>
    | ((self: A) => Observable<B>);
  const mapper = mapTo<A, B, K>(key);

  return extend((self) => {
    const initialValue = isSelfFn(initial) ? initial(self) : initial;
    const observable$ = isSelfFn(observable) ? observable(self) : observable;

    return {
      initial: initialValue,
      subscriber: concat(of(initialValue), observable$),
      map: mapper
    };
  });
}
