import { extend } from '~/abstracts';
import { TFu, TFn } from '~/types';
import { Observable, of, concat } from 'rxjs';
import { mapTo, isFn } from '~/utils';

export default withObservable;

function withObservable<A extends object, B extends object>(
  initial: B | TFn<A, B>,
  observable: Observable<B> | TFn<A, Observable<B>>
): TFu<A, A & B>;
function withObservable<A extends object, B, K extends string>(
  key: K,
  initial: B | TFn<A, B>,
  observable: Observable<B> | TFn<A, Observable<B>>
): TFu<A, A & { [P in K]: B }>;

function withObservable<A extends object, B, K extends string>(
  a: B | TFn<A, B> | K,
  b: B | TFn<A, B> | Observable<B> | TFn<A, Observable<B>>,
  c?: Observable<B> | TFn<A, Observable<B>>
): TFu<A, A & (B | { [P in K]: B })> {
  const hasKey = typeof a === 'string';
  const key = hasKey ? (a as K) : null;
  const initial = (hasKey ? b : a) as B | TFn<A, B>;
  const observable = (hasKey ? c : b) as Observable<B> | TFn<A, Observable<B>>;
  const mapper = mapTo<A, B, K>(key);

  return extend((self, collect) => {
    const initialValue = isFn(initial) ? initial(self, collect) : initial;
    const observable$ = isFn(observable)
      ? observable(self, collect)
      : observable;

    return {
      initial: initialValue,
      subscriber: concat(of(initialValue), observable$),
      map: mapper
    };
  });
}
