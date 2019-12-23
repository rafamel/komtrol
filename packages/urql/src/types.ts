import { Client, CombinedError, UseQueryArgs } from 'urql';
import { ASTNode } from 'graphql';

// eslint-disable-next-line @typescript-eslint/prefer-interface
export type TGql<T> = ASTNode;

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
  Pick<UseQueryArgs<V>, 'variables' | 'requestPolicy' | 'pause'>;
export interface IQueryResponse<T> extends IResponse<T> {
  execute: TQueryExecute;
}
export type TQueryExecute = (options?: TQueryExecuteOptions) => void;
export type TQueryExecuteOptions = Pick<UseQueryArgs<any>, 'requestPolicy'>;

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
