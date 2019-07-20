import { TTransform, TPolicy } from '~/types';
import { Subject } from 'rxjs';
import transform from '~/transform';

export default function block<A extends object, B>(
  policy: TPolicy<A, B>
): TTransform<A, B, B> {
  return transform(({ subscriber, ...b }, collect) => {
    if (!subscriber) return b;
    if (typeof policy !== 'function') {
      return policy ? { subscriber, ...b } : b;
    }

    const subject = new Subject<void>();
    const policyFn = policy(collect);
    let hasInit = false;
    let lastSelf: A;
    let lastB: B;

    const subscription = subscriber.subscribe(() => {
      const res = b.execute(lastSelf, 'emit');
      if (policyFn(res, lastB)) {
        lastB = res;
        subject.next();
      }
    });

    return {
      subscriber: subject,
      execute(self, signal) {
        if (hasInit && signal === 'emit') return lastB;

        hasInit = true;
        lastSelf = self;
        lastB = b.execute(self, signal);
        return lastB;
      },
      teardown() {
        if (b.teardown) b.teardown();
        subscription.unsubscribe();
      }
    };
  });
}
