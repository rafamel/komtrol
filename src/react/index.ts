import { Source, EmptyUnion } from '../sources';
import { useSourceTrunk } from './trunk';
import { LifecycleFn } from './types';

export function useSource<S = EmptyUnion, T extends Source<S> = Source<S>>(
  source: () => T & Source<S>,
  lifecycle?: LifecycleFn<T>
): T;
export function useSource<
  S = EmptyUnion,
  C extends object = object,
  T extends Source<S> = Source<S>
>(
  context: C,
  source: (context: C) => T & Source<S>,
  lifecycle?: LifecycleFn<T, C>
): T;
export function useSource(a: any, b?: any, c?: any): Source<any> {
  return typeof a === 'function'
    ? useSourceTrunk({}, a, b)
    : useSourceTrunk(a, b, c);
}
