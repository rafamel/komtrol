import { fu, mapTo, combine, TFu } from 'komfu';
import {
  IQueryResponse,
  TQueryOptions,
  TQueryOnResponse,
  TQueryExecuteOptions
} from './types';
import { createRequest, GraphQLRequest } from 'urql';
import { pipe as wonkaPipe, subscribe as wonkaSubscribe } from 'wonka';
import noOp from './utils/no-op';
import getClient from './utils/get-client';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

export default withQuery;

function withQuery<A extends object, T = any, V extends object = object>(
  options: TQueryOptions<T, V> | ((self: A) => TQueryOptions<T, V>),
  onResponse?: TQueryOnResponse<A, T>
): TFu<A, A & IQueryResponse<T>>;
function withQuery<A extends object, V extends object = object>(
  options: TQueryOptions<any, V> | ((self: A) => TQueryOptions<any, V>),
  onResponse?: TQueryOnResponse<A, any>
): TFu<A, A & IQueryResponse<any>>;
function withQuery<
  A extends object,
  K extends string,
  T = any,
  V extends object = object
>(
  key: K,
  options: TQueryOptions<T, V> | ((self: A) => TQueryOptions<T, V>),
  onResponse?: TQueryOnResponse<A, T>
): TFu<A, A & { [P in K]: IQueryResponse<T> }>;
function withQuery<
  A extends object,
  K extends string,
  V extends object = object
>(
  key: any,
  options: TQueryOptions<any, V> | ((self: A) => TQueryOptions<any, V>),
  onResponse?: TQueryOnResponse<A, any>
): TFu<A, A & { [P in K]: IQueryResponse<any> }>;

function withQuery<
  A extends object,
  K extends string,
  T = any,
  V extends object = object
>(
  a: TQueryOptions<T, V> | ((self: A) => TQueryOptions<T, V>) | K,
  b?:
    | TQueryOnResponse<A, T>
    | TQueryOptions<T, V>
    | ((self: A) => TQueryOptions<T, V>),
  c?: TQueryOnResponse<A, T>
): TFu<A, A & (IQueryResponse<T> | { [P in K]: IQueryResponse<T> })> {
  const hasKey = typeof a === 'string';
  const key = hasKey ? (a as K) : null;
  const options = (hasKey ? b : a) as (
    | TQueryOptions<T, V>
    | ((self: A) => TQueryOptions<T, V>));
  const onResponse = hasKey ? c : (b as TQueryOnResponse<A, T>);
  const mapper = mapTo<A, IQueryResponse<T>, K>(key);

  return fu((instance) => {
    let globalSelf: A = instance.initial;
    const globalExecute = (execOpts?: TQueryExecuteOptions): void => {
      const [request, opts] = getRequestOptions<A, T, V>(options, globalSelf);
      execute(request, execOpts ? { ...opts, ...execOpts } : opts, globalSelf);
    };

    const subject = new BehaviorSubject({ ...noOp(), execute: globalExecute });

    let unsubscribe = (): void => {};
    function execute(
      request: GraphQLRequest,
      options: TQueryOptions<any, any>,
      self: A
    ): void {
      unsubscribe();
      const client = getClient(options, self);
      const subscription = wonkaPipe(
        client.executeQuery(request, { requestPolicy: options.requestPolicy }),
        wonkaSubscribe(async ({ data, error }) => {
          const update: IQueryResponse<T> = {
            execute: globalExecute,
            fetching: false,
            data,
            error
          };
          if (
            !onResponse ||
            (await onResponse(update, {
              self,
              current: subject.value
            }))
          ) {
            subject.next(update);
          }
        })
      );
      unsubscribe = subscription[0];
    }

    let lastKey: null | number = null;
    return {
      ...combine(
        [instance.initial, subject.value],
        [
          instance.subscriber.pipe(
            tap((a) => {
              globalSelf = a;
              const [request, opts] = getRequestOptions(options, a);
              if (request.key !== lastKey) {
                lastKey = request.key;
                execute(request, opts, a);
              }
            })
          ),
          subject
        ],
        mapper
      ),
      teardown() {
        unsubscribe();
      }
    };
  });
}

function getRequestOptions<A, T, V extends object>(
  options: TQueryOptions<T, V> | ((self: A) => TQueryOptions<T, V>),
  self: A
): [GraphQLRequest, TQueryOptions<any, any>] {
  const opts = typeof options === 'function' ? options(self) : options;
  return [createRequest(opts.query, opts.variables), opts];
}
