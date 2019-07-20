import transform from '~/transform';
import { TTransform, TPolicy } from '~/types';

export default function memo<A extends object, B>(
  policy: TPolicy<A, A>
): TTransform<A, B, B> {
  return transform((b, collect) => {
    let hasInit = false;
    let last: B;

    if (typeof policy !== 'function') {
      return policy
        ? b
        : {
            ...b,
            execute(self, signal) {
              if (!hasInit || signal === 'emit') {
                last = b.execute(self, signal);
                hasInit = true;
              }
              return last;
            }
          };
    }

    const policyFn = policy(collect);
    let current: A;
    return {
      ...b,
      execute(next, signal) {
        if (!hasInit || signal === 'emit') {
          last = b.execute(next, signal);
          hasInit = true;
        } else if (policyFn(next, current)) {
          last = b.execute(next, signal);
        }
        current = next;
        return last;
      }
    };
  });
}
