import transform from '~/transform';
import { TTransform } from '~/types';

export default function map<A extends object, B, T>(
  fn: (data: B) => T
): TTransform<A, B, T> {
  return transform(({ execute, ...b }) => ({
    ...b,
    execute: (data, signal) => fn(execute(data, signal))
  }));
}
