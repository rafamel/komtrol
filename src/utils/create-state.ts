import { IFuInstance } from '../types';
import { BehaviorSubject, Observable } from 'rxjs';
import createSetter from './create-setter';
import combineMerge from './combine-merge';
import keyMap from './key-map';

export interface ICreateState<A, B, K extends string> {
  set: (update: B | ((value: B) => B)) => void;
  subject: BehaviorSubject<B>;
  instance: {
    initial: A & { [P in K]: B };
    subscriber: Observable<A & { [P in K]: B }>;
  };
}

export default function createState<A, B, K extends string>(
  key: K,
  initial: B,
  instance: Required<IFuInstance<A>>
): ICreateState<A, B, K> {
  const $value = new BehaviorSubject(initial);
  const set = createSetter($value);
  const mapper = keyMap(key);

  return {
    set,
    subject: $value,
    instance: combineMerge(
      [instance.initial, initial],
      [instance.subscriber, $value],
      mapper
    )
  };
}
