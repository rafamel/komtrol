import { BehaviorSubject } from 'rxjs';

export type TSetter<T> = (update: T | ((value: T) => T)) => void;

export default function createSetter<T>(
  subject: BehaviorSubject<T>
): TSetter<T> {
  return function set(update) {
    const value =
      typeof update === 'function'
        ? (update as ((value: T) => T))(subject.value)
        : update;
    subject.next(value);
  };
}
