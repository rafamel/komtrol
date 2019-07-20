import { TFn, TIntermediate, TUnion } from '~/types';
import { map as _map } from 'rxjs/operators';
import { intercept } from '~/abstracts';

export default withMap;

/* Declarations */
function withMap<A extends object, B extends object | void, T extends object>(
  map: TFn<A, B, T>
): (intermediate: TIntermediate<A, B>) => TIntermediate<Readonly<T>, void>;
function withMap<
  A extends object,
  B extends object | void,
  T extends object,
  K extends keyof A | keyof B
>(
  key: K,
  map: TFn<A, B, T>
): (
  intermediate: TIntermediate<A, B>
) => TIntermediate<Readonly<Omit<TUnion<A, B>, K> & { [P in K]: T }>, void>;

/* Implementation */
function withMap(a: any, b?: any): any {
  return typeof a === 'string' ? trunk(a as any, b) : trunk(null, a);
}

function trunk<
  A extends object,
  B extends object | void,
  T extends object,
  K extends keyof A | keyof B | null
>(
  key: K,
  map: TFn<A, B, T>
): (intermediate: TIntermediate<A, B>) => TIntermediate<any, void> {
  return key === null
    ? intercept((instance, collect) => ({
        initial: map(instance.initial, collect),
        subscriber: instance.subscriber.pipe(_map((x) => map(x, collect)))
      }))
    : intercept((instance, collect) => ({
        initial: {
          ...instance.initial,
          [key as any]: map(instance.initial, collect)
        },
        subscriber: instance.subscriber.pipe(
          _map((x) => ({ ...x, [key as any]: map(x, collect) }))
        )
      }));
}
