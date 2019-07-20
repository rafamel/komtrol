import { IFuseInstance, TUnion, TIntermediate } from './types';
import { consolidate } from './utils';
import { of } from 'rxjs';

export default create;

function create<A extends object, B extends object | void>(
  pipeline: (intermediate: TIntermediate<{}, void>) => TIntermediate<A, B>,
  initial?: void
): IFuseInstance<TUnion<A, B>>;
function create<
  T extends object | void,
  A extends object,
  B extends object | void
>(
  pipeline: (intermediate: TIntermediate<{}, T>) => TIntermediate<A, B>,
  initial: T
): IFuseInstance<TUnion<A, B>>;

function create<
  T extends object | void,
  A extends object,
  B extends object | void
>(
  pipeline: (intermediate: TIntermediate<{}, T>) => TIntermediate<A, B>,
  initial: T
): IFuseInstance<TUnion<A, B>> {
  const intermediate = pipeline([
    {
      initial: {},
      subscriber: of({}),
      teardown: () => {}
    },
    { execute: () => initial }
  ]);

  return consolidate(intermediate).instance;
}
