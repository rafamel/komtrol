import { IRequestOptions } from '../types';
import { Client } from 'urql';

export default function getClient(
  options: IRequestOptions<any>,
  self: any
): Client {
  const client: Client =
    options.client || (self.context && self.context.client);

  if (!client) {
    throw Error(
      `GraphQL client was expected to be passed in options or exist in context`
    );
  }
  return client;
}
