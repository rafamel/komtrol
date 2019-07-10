import { BehaviorSubject } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function createSetter<T>(subject: BehaviorSubject<T>) {
  return function set(update: T | ((value: T) => T)): void {
    const value =
      typeof update === 'function'
        ? (update as ((value: T) => T))(subject.value)
        : update;
    subject.next(value);
  };
}
