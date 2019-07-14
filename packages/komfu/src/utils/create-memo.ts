import { TUpdatePolicy } from '~/types';

export default function createMemo<A, B>(
  policy: TUpdatePolicy<A>,
  fn: (self: A) => B
): (next: A) => B {
  if (typeof policy !== 'function') {
    if (!policy) {
      let hasInit = false;
      let value: B;
      return (next) => {
        if (!hasInit) {
          value = fn(next);
          hasInit = true;
        }
        return value;
      };
    } else {
      return (next) => fn(next);
    }
  }

  let hasInit = false;
  let self: A;
  let value: B;
  const policyFn = policy();
  return (next) => {
    if (!hasInit) {
      value = fn(next);
      hasInit = true;
    } else if (policyFn(self, next)) {
      value = fn(next);
    }
    self = next;

    return value;
  };
}
