import { stateful } from '~/abstracts';
import { TFu } from '~/types';

export interface IStates<T extends object> {
  state: T;
  setState(update: Partial<T> | ((value: T) => Partial<T>)): void;
}

export default function withStates<A extends object, T extends object>(
  initial: T | (() => T)
): TFu<A, A & IStates<T>> {
  return stateful(initial, (state) => {
    function setState(update: T | ((value: T) => T)): void {
      const current = state.current;
      const value = updateIsFn(update) ? update(current) : update;
      state.set({ ...current, ...value });
    }

    return {
      map: (a: A, b: T) => ({ ...a, state: b, setState })
    };
  });
}

export function updateIsFn<T>(
  update: Partial<T> | ((value: T) => Partial<T>)
): update is (value: T) => Partial<T> {
  return typeof update === 'function';
}
