import { TFn } from '~/types';

export default function isFn<A, T>(value: T | TFn<A, T>): value is TFn<A, T> {
  return typeof value === 'function';
}
