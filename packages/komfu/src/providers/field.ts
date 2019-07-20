import { TFu, TFn, TUpdatePolicy } from '~/types';
import { fu } from '~/abstracts';
import pipe from '~/pipe';
import { key, memo } from '~/transforms';

export default withField;

/* Declarations */
function withField<A extends object, B extends object | void, T extends object>(
  compute: TFn<A, B, T>
): TFu<A, B, T>;
function withField<A extends object, B extends object | void, T extends object>(
  policy: TUpdatePolicy<A, B>,
  compute: TFn<A, B, T>
): TFu<A, B, T>;
function withField<
  A extends object,
  B extends object | void,
  T,
  K extends string
>(key: K, compute: TFn<A, B, T>): TFu<A, B, { [P in K]: T }>;
function withField<
  A extends object,
  B extends object | void,
  T,
  K extends string
>(
  key: K,
  policy: TUpdatePolicy<A, B>,
  compute: TFn<A, B, T>
): TFu<A, B, { [P in K]: T }>;

/* Implementation */
function withField(a: any, b?: any, c?: any): any {
  if (typeof a === 'string') {
    return c === undefined
      ? pipe.f(trunk(b), key(a), memo(false))
      : pipe.f(trunk(c), key(a), memo(b));
  } else {
    return b === undefined
      ? pipe.f(trunk(a), memo(false))
      : pipe.f(trunk(b), memo(a));
  }
}

export function trunk<A extends object, B extends object | void, T>(
  compute: TFn<A, B, T>
): TFu<A, B, T> {
  return fu((collect) => {
    return {
      execute: () => compute(collect(), collect)
    };
  });
}
