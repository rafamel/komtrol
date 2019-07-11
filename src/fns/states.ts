import fu from '~/fu';
import { TFu } from '~/types';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import combineMerge from '~/utils/combine-merge';

export interface IStates<T extends object> {
  state: T;
  setState(update: Partial<T> | ((value: T) => Partial<T>)): void;
}

export default function withStates<A, T extends object>(
  initial: T | (() => T)
): TFu<A, A & IStates<T>> {
  return fu((instance) => {
    const initialValue = initialIsFn(initial) ? initial() : initial;
    const subject = new BehaviorSubject(initialValue);

    function setState(update: T | ((value: T) => T)): void {
      const value = updateIsFn(update) ? update(subject.value) : update;
      subject.next({ ...subject.value, ...value });
    }

    return combineMerge(
      [instance.initial, { state: initialValue, setState }],
      [instance.subscriber, subject.pipe(map((b) => ({ state: b, setState })))]
    );
  });
}

export function initialIsFn<T>(initial: (() => T) | T): initial is () => T {
  return typeof initial === 'function';
}

export function updateIsFn<T>(
  update: Partial<T> | ((value: T) => Partial<T>)
): update is (value: T) => Partial<T> {
  return typeof update === 'function';
}
