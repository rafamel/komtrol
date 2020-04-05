import { useRef, useEffect, useState } from 'react';
import { Source } from '../super';
import { pipeInto as into } from 'ts-functional-pipe';
import { Observable } from 'rxjs';
import { EmptyUnion } from '../types';
import { useValue } from './use-value';

export type ObservableFn<T, D = undefined> = (
  deps: D extends EmptyUnion ? undefined : Source<D>
) => Observable<T>;

export function useObservable<F, T>(
  fallback: F,
  observable: ObservableFn<T>
): F | T;
export function useObservable<F, T, D>(
  deps: D,
  fallback: F,
  observable: ObservableFn<T, D>
): F | T;

/**
 * Subscribes to an `Observable` with an optional fallback
 * value, optionally passing dependencies as a `Source`.
 */
export function useObservable<F, T, D = undefined>(
  a: F | D,
  b: ObservableFn<T> | F,
  c?: ObservableFn<T, D>
): T | F {
  return into(
    null,
    (): [D, F, ObservableFn<T, D>] => {
      return c ? [a, b, c] : ([undefined, a, b] as any);
    },
    ([deps, fallback, observable]) => {
      const running = useRef<boolean>(true);
      running.current = true;

      const instance = useValue(deps, observable);
      const value = useRef<F | T>(fallback);
      const update = useState(0)[1];

      useEffect(() => {
        let i = 0;
        const subscription = instance.subscribe((item) => {
          value.current = item;
          if (!running.current) update((i = i + 1));
        });

        return () => subscription.unsubscribe();
      }, []);

      running.current = false;
      return value.current;
    }
  );
}
