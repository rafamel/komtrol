import { TCollect } from '~/types';

export interface ICache<T> {
  collect: TCollect<T>;
  set: (value: T) => T;
}

export default function createCache<T>(initial: T): ICache<T> {
  let current = initial;
  return {
    collect() {
      return current;
    },
    set(value: T): T {
      return (current = value);
    }
  };
}
