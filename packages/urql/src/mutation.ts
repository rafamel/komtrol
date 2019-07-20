import {
  pipe,
  key,
  TFu,
  TFn,
  TPolicy,
  block,
  stateful,
  createCache,
  TUnion
} from 'komfu';
import {
  TMutationOptions,
  IMutationResponse,
  IMutationExecuteOptions
} from './types';
import noOp from './utils/no-op';
import { createRequest } from 'urql';
import { pipe as wonkaPipe, toPromise as wonkaToPromise } from 'wonka';
import getClient from './utils/get-client';

export default withMutation;

/* Declarations */
function withMutation<A extends object, B extends object | void, T = any>(
  options: TMutationOptions<T> | TFn<A, B, TMutationOptions<T>>,
  after?: TPolicy<TUnion<A, B>, IMutationResponse<T>>
): TFu<A, B, IMutationResponse<T>>;
function withMutation<
  A extends object,
  B extends object | void,
  K extends string,
  T = any
>(
  key: K,
  options: TMutationOptions<T> | TFn<A, B, TMutationOptions<T>>,
  after?: TPolicy<TUnion<A, B>, IMutationResponse<T>>
): TFu<A, B, { [P in K]: IMutationResponse<T> }>;

/* Implementation */
function withMutation(a: any, b?: any, c?: any): any {
  if (typeof a === 'string') {
    return c === undefined
      ? pipe.f(trunk(b), key(a))
      : pipe.f(trunk(b), block(c), key(a));
  } else {
    return b === undefined ? trunk(a) : pipe.f(trunk(a), block(b));
  }
}

export function trunk<A extends object, B extends object | void, T = any>(
  options: TMutationOptions<T> | TFn<A, B, TMutationOptions<T>>
): TFu<A, B, IMutationResponse<T>> {
  return stateful((collect, emit) => {
    const cache = createCache({ ...noOp(), execute });

    function execute<V = object>(
      execOpts: IMutationExecuteOptions<V> = {}
    ): void {
      const self = collect();
      const opts =
        typeof options === 'function' ? options(self, collect) : options;
      const request = createRequest(opts.query, execOpts.variables as any);
      const client = getClient(opts, self);
      wonkaPipe(client.executeMutation(request), wonkaToPromise).then(
        ({ data, error }) => {
          cache.set({ fetching: false, execute, data, error });
          emit();
        }
      );
    }

    return {
      execute: () => cache.collect()
    };
  });
}
