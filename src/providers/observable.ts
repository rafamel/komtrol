import { extend } from '~/abstracts';
import { TFu } from '~/types';
import { Observable, of, concat } from 'rxjs';
import { mapTo, isFn } from '~/utils';

export default withObservable;

function withObservable<A extends object, B extends object>(
  initial: B | (() => B),
  observable: Observable<B> | (() => Observable<B>)
): TFu<A, A & B>;
function withObservable<A extends object, B, K extends string>(
  key: K,
  initial: B | (() => B),
  observable: Observable<B> | (() => Observable<B>)
): TFu<A, A & { [P in K]: B }>;

function withObservable<A extends object, B, K extends string>(
  a: B | (() => B) | K,
  b: B | (() => B) | Observable<B> | (() => Observable<B>),
  c?: Observable<B> | (() => Observable<B>)
): TFu<A, A & (B | { [P in K]: B })> {
  const hasKey = typeof a === 'string';
  const key = hasKey ? (a as K) : null;
  const initial = (hasKey ? b : a) as B | (() => B);
  const observable = (hasKey ? c : b) as Observable<B> | (() => Observable<B>);
  const mapper = mapTo<A, B, K>(key);

  return extend(() => {
    const initialValue = isFn(initial) ? initial() : initial;
    const observable$ = isFn(observable) ? observable() : observable;

    return {
      initial: initialValue,
      subscriber: concat(of(initialValue), observable$),
      map: mapper
    };
  });
}
