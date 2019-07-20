import { consolidate } from '~/utils';
import {
  TIntermediate,
  TUnion,
  TIntercept,
  IInstance,
  TCollect,
  IParentInstance
} from '~/types';
import pipe from '~/pipe';

export default function intercept<
  A extends object,
  B extends object | void,
  T extends object
>(
  intercept: (
    instance: IParentInstance<TUnion<A, B>>,
    collect: TCollect<TUnion<A, B>>
  ) => IInstance<T>
): TIntercept<A, B, T> {
  return pipe.f(
    (intermediate: TIntermediate<A, B>) => consolidate(intermediate),
    ({ instance: { teardown, ...parent }, collect }) => {
      const instance = intercept(parent, collect);

      return {
        ...instance,
        teardown() {
          teardown();
          if (instance.teardown) instance.teardown();
        }
      };
    },
    (instance): TIntermediate<T, void> => [instance, { execute: () => {} }]
  );
}
