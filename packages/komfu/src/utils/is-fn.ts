import { TFn } from '~/types';

export default function isFn<A extends object, B extends object | void, T>(
  value: T | TFn<A, B, T>
): value is TFn<A, B, T> {
  return typeof value === 'function';
}
