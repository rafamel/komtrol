import { useRef } from 'react';
import { Source } from '../super';
import { into } from 'pipettes';
import { useObservable } from './use-observable';
import { NonDefinedUnion } from '../types';
import { useValue } from './use-value';

const noblock = (): boolean => false;

export type SourceFn<T extends Source<any>, P = void> = (
  props: P extends NonDefinedUnion ? undefined : Source<P>
) => T;

export function useSource<T extends Source<any>>(source: SourceFn<T>): T;
export function useSource<T extends Source<any>, P = void>(
  props: P,
  source: SourceFn<T, P>,
  block?: () => boolean
): T;

/**
 * Subscribes to a `Source`, optionally passing `props` as a `Source`.
 */
export function useSource<T extends Source<any>, P = void>(
  a: SourceFn<T, P> | P,
  b?: SourceFn<T, P>,
  c?: () => boolean
): T {
  return into(
    (): [P, SourceFn<T, P>, () => boolean] => {
      return b ? [a, b, c || noblock] : ([undefined, a, noblock] as any);
    },
    (params) => {
      const [props, sourceFn, block] = params();

      const running = useRef<boolean>(true);
      running.current = true;

      const instance = useValue(props, sourceFn);
      useObservable(
        undefined,
        instance.state,
        () => instance.state$,
        () => running.current || block()
      );

      running.current = false;
      return instance;
    }
  );
}
