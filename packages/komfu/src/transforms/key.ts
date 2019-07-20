import transform from '~/transform';
import { TTransform, IProviderInstance } from '~/types';

export default key;

function key<A extends object, B, K extends string>(
  key: K
): TTransform<A, B, { [P in K]: B }>;
function key<A extends object, B, K extends string>(
  key: null
): TTransform<A, B, B>;
function key<A extends object, B, K extends string>(
  key: K | null
): TTransform<A, B, B | { [P in K]: B }>;

function key<A extends object, B, K extends string>(
  key: K | null
): TTransform<A, B, B | { [P in K]: B }> {
  return transform(
    (b): IProviderInstance<A, B | { [P in K]: B }> => {
      return key === null
        ? b
        : {
            ...b,
            execute: (self, signal) =>
              ({ [key]: b.execute(self, signal) } as ({ [P in K]: B }))
          };
    }
  );
}
