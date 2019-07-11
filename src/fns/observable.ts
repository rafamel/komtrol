import fu from '~/fu';
import { TFu } from '~/types';
import { Observable } from 'rxjs';
import { keyMap, combineMerge } from '~/utils';

export default withObservable;

function withObservable<A, B extends object>(
  initial: B | (() => B),
  observable: Observable<B> | (() => Observable<B>)
): TFu<A, A & B>;
function withObservable<A, B, K extends string>(
  key: K,
  initial: B | (() => B),
  observable: Observable<B> | (() => Observable<B>)
): TFu<A, A & { [P in K]: B }>;

function withObservable<A, B, K extends string>(
  a: B | (() => B) | K,
  b: B | (() => B) | Observable<B> | (() => Observable<B>),
  c?: Observable<B> | (() => Observable<B>)
): TFu<A, A & (B | { [P in K]: B })> {
  const hasKey = typeof a === 'string';
  const key = hasKey ? (a as K) : null;
  const initial = (hasKey ? b : a) as B | (() => B);
  const observable = (hasKey ? c : b) as Observable<B> | (() => Observable<B>);
  const mapper = keyMap(key);

  return fu((instance) => {
    const initialValue = isNoParamsFn(initial) ? initial() : initial;
    const observable$ = isNoParamsFn(observable) ? observable() : observable;
    return combineMerge(
      [instance.initial, initialValue],
      [instance.subscriber, observable$],
      mapper
    );
  });
}

export function isNoParamsFn<T>(value: T | (() => T)): value is () => T {
  return typeof value === 'function';
}
