import { useRef, useEffect, useState } from 'react';
import { Source } from '../super';
import { Observable } from 'rxjs';
import { NonDefinedUnion } from '../types';
import { useValue } from './use-value';
import { into } from 'pipettes';

const noblock = (): boolean => false;

export type ObservableFn<T, P = void> = (
  props: P extends NonDefinedUnion ? undefined : Source<P>
) => Observable<T>;

export function useObservable<F, T>(
  fallback: F,
  observable: ObservableFn<T>
): F | T;
export function useObservable<F, T, P = void>(
  props: P,
  fallback: F,
  observable: ObservableFn<T, P>,
  block?: () => boolean
): F | T;

/**
 * Subscribes to an `Observable` with an optional fallback
 * value, optionally passing `props` as a `Source`.
 */
export function useObservable<F, T, P = void>(
  a: F | P,
  b: ObservableFn<T> | F,
  c?: ObservableFn<T, P>,
  d?: () => boolean
): T | F {
  return into(
    (): [P, F, ObservableFn<T, P>, () => boolean] => {
      return c ? [a, b, c, d || noblock] : ([undefined, a, b, noblock] as any);
    },
    (params) => {
      const [props, fallback, observable, block] = params();
      const running = useRef<boolean>(true);
      running.current = true;

      const instance = useValue(props, observable);
      const value = useRef<F | T>(fallback);
      const update = useState(0)[1];

      useEffect(() => {
        let i = 0;
        const subscription = instance.subscribe((item) => {
          value.current = item;
          if (!running.current && !block()) update((i = i + 1));
        });

        return () => subscription.unsubscribe();
      }, []);

      running.current = false;
      return value.current;
    }
  );
}
