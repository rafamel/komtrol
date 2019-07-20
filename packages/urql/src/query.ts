import {
  pipe,
  key,
  TFu,
  TFn,
  TPolicy,
  block,
  stateful,
  createCache,
  TCollect,
  TUnion
} from 'komfu';
import { TQueryOptions, IQueryResponse, TQueryExecuteOptions } from './types';
import noOp from './utils/no-op';
import { createRequest, GraphQLRequest } from 'urql';
import { pipe as wonkaPipe, subscribe as wonkaSubscribe } from 'wonka';
import getClient from './utils/get-client';

export default withQuery;

/* Declarations */
function withQuery<
  A extends object,
  B extends object | void,
  V extends object = object,
  T = any
>(
  options: TQueryOptions<T, V> | TFn<A, B, TQueryOptions<T, V>>,
  after?: TPolicy<TUnion<A, B>, IQueryResponse<T>>
): TFu<A, B, IQueryResponse<T>>;
function withQuery<
  A extends object,
  B extends object | void,
  K extends string,
  V extends object = object,
  T = any
>(
  key: K,
  options: TQueryOptions<T, V> | TFn<A, B, TQueryOptions<T, V>>,
  after?: TPolicy<TUnion<A, B>, IQueryResponse<T>>
): TFu<A, B, { [P in K]: IQueryResponse<T> }>;

/* Implementation */
function withQuery(a: any, b: any, c?: any): any {
  if (typeof a === 'string') {
    return c === undefined
      ? pipe.f(trunk(b), key(a))
      : pipe.f(trunk(b), block(c), key(a));
  } else {
    return b === undefined ? trunk(a) : pipe.f(trunk(a), block(b));
  }
}

export function trunk<
  A extends object,
  B extends object | void,
  V extends object = object,
  T = any
>(
  options: TQueryOptions<T, V> | TFn<A, B, TQueryOptions<T, V>>
): TFu<A, B, IQueryResponse<T>> {
  return stateful((collect, emit) => {
    let paused = false;
    let lastKey: null | number = null;
    let unsubscribe: void | (() => void);
    const cache = createCache({ ...noOp(), execute: globalExecute });

    function globalExecute(execOpts?: TQueryExecuteOptions): void {
      const opts = getOptions(options, collect(), collect);
      execute(execOpts ? { ...opts, ...execOpts } : opts, true, collect());
    }

    function execute(
      options: TQueryOptions<any, any>,
      force: boolean,
      self: TUnion<A, B>
    ): void {
      const current = cache.collect();

      if (options.pause) {
        if (paused) return;

        paused = true;
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = undefined;
        }
        if (current.fetching) {
          cache.set({ ...current, fetching: false });
          emit();
        }
        return;
      }

      paused = false;
      const request = getRequest(options);
      if (!force && !paused && request.key === lastKey) return;

      lastKey = request.key;
      if (unsubscribe) unsubscribe();
      if (!current.fetching) {
        cache.set({ ...current, fetching: true });
        emit();
      }

      const client = getClient(options, self);
      const subscription = wonkaPipe(
        client.executeQuery(request, {
          requestPolicy: options.requestPolicy
        }),
        wonkaSubscribe(async ({ data, error }) => {
          cache.set({
            execute: globalExecute,
            fetching: false,
            data,
            error
          });
          emit();
        })
      );
      unsubscribe = subscription[0];
    }

    return {
      execute: (self, signal) => {
        if (signal === 'initial' || signal === 'next') {
          const opts = getOptions(options, self, collect);
          execute(opts, false, self);
        }
        return cache.collect();
      },
      teardown() {
        if (unsubscribe) unsubscribe();
      }
    };
  });
}

function getOptions<
  A extends object,
  B extends object | void,
  T,
  V extends object
>(
  options: TQueryOptions<T, V> | TFn<A, B, TQueryOptions<T, V>>,
  self: TUnion<A, B>,
  collect: TCollect<TUnion<A, B>>
): TQueryOptions<T, V> {
  return typeof options === 'function' ? options(self, collect) : options;
}

function getRequest(options: TQueryOptions<any, any>): GraphQLRequest {
  return createRequest(options.query, options.variables);
}
