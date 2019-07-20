import { consolidate } from '~/utils';
import {
  TIntermediate,
  TFu,
  TUnion,
  TCollect,
  IProviderInstance
} from '~/types';

export default function fu<A extends object, B extends object | void, T>(
  initialize: (
    collect: TCollect<TUnion<A, B>>
  ) => IProviderInstance<TUnion<A, B>, T>
): TFu<A, B, T> {
  return (intermediate: TIntermediate<A, B>) => {
    const { instance, collect } = consolidate(intermediate);
    return [instance, initialize(collect)];
  };
}
