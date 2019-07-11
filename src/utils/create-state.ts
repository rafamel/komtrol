import { IFuInstance } from '../types';
import { BehaviorSubject } from 'rxjs';
import createSetter from './create-setter';
import combineMerge from './combine-merge';
import { map } from 'rxjs/operators';

export default function createState<A, B, K extends string>(
  key: K,
  initial: B,
  instance: Required<IFuInstance<A>>
): {
  set: (update: B | ((value: B) => B)) => void;
  subject: BehaviorSubject<B>;
  instance: Required<
    Pick<IFuInstance<A & { [P in K]: B }>, 'initial' | 'subscriber'>
  >;
} {
  const $value = new BehaviorSubject(initial);
  const set = createSetter($value);

  return {
    set,
    subject: $value,
    instance: combineMerge(
      [instance.initial, { [key]: initial } as any],
      [instance.subscriber, $value.pipe(map((b) => ({ [key]: b } as any)))]
    )
  };
}
