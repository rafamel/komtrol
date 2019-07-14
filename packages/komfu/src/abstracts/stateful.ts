import { TFu, TFn, IStatefulInstance } from '~/types';
import { BehaviorSubject } from 'rxjs';
import extend from './extend';
import createSetter, { TSetter } from '~/utils/create-setter';
import { isFn } from '~/utils';

export interface IStateful<T> {
  current: T;
  set: TSetter<T>;
}

export default function stateful<A extends object, B, C extends A>(
  initial: B | TFn<A, B>,
  initialize: (state: IStateful<B>) => IStatefulInstance<A, B, C>
): TFu<A, C> {
  return extend((self, collect) => {
    const initialValue = isFn(initial) ? initial(self, collect) : initial;
    const subject = new BehaviorSubject<B>(initialValue);

    const stateful = {
      set: createSetter(subject),
      get current() {
        return subject.value;
      }
    };

    return {
      ...initialize(stateful),
      initial: initialValue,
      subscriber: subject
    };
  });
}
