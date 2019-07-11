import { Client, CombinedError, UseQueryArgs } from 'urql';

// eslint-disable-next-line @typescript-eslint/prefer-interface
export type TGql<T> = { [key: string]: any };

export interface IRequestOptions<T> {
  client?: Client;
  query: TGql<T> | string;
}
export interface IResponse<T> {
  fetching: boolean;
  error?: CombinedError;
  data?: T;
}

/* Query */
export type TQueryOptions<T, V> = IRequestOptions<T> &
  Pick<UseQueryArgs<V>, 'variables' | 'requestPolicy'>;
export interface IQueryResponse<T> extends IResponse<T> {
  execute: TQueryExecute;
}
export type TQueryExecute = (options?: TQueryExecuteOptions) => void;
export type TQueryExecuteOptions = Pick<UseQueryArgs<any>, 'requestPolicy'>;
export type TQueryOnResponse<A, B> = (
  update: IQueryResponse<B>,
  context: { self: A; current: IQueryResponse<B> }
) => boolean | Promise<boolean>;

/* Mutation */
export type TMutationOptions<T> = IRequestOptions<T>;
export interface IMutationResponse<T> extends IResponse<T> {
  execute: TMutationExecute;
}
export type TMutationExecute = <V = object>(
  options?: IMutationExecuteOptions<V>
) => void;
export interface IMutationExecuteOptions<V> {
  variables?: V;
}
export type TMutationOnResponse<A, B> = (
  update: IMutationResponse<B>,
  context: { self: A; current: IMutationResponse<B> }
) => boolean | Promise<boolean>;
