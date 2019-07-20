import { consolidate } from '~/utils';
import { Subject } from 'rxjs';
import {
  TIntermediate,
  TFu,
  TUnion,
  TCollect,
  IProviderInstance
} from '~/types';

export default function stateful<A extends object, B extends object | void, T>(
  initialize: (
    collect: TCollect<TUnion<A, B>>,
    emit: () => void
  ) => IProviderInstance<TUnion<A, B>, T>
): TFu<A, B, T> {
  return (intermediate: TIntermediate<A, B>) => {
    const subject = new Subject<void>();
    const emit = (): void => subject.next();
    const { instance, collect } = consolidate(intermediate);

    return [instance, { ...initialize(collect, emit), subscriber: subject }];
  };
}
