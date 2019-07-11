import { TFu } from '~/types';
import fu from '~/fu';
import { combineMerge } from '~/utils';
import { BehaviorSubject } from 'rxjs';
import { toStream } from 'mobx-utils';

export default withMobx;

function withMobx<A, B extends object>(fn: () => B): TFu<A, A & B>;
function withMobx<A, B, K extends string>(
  key: K,
  fn: () => B
): TFu<A, A & { [P in K]: B }>;

function withMobx<A, B, K extends string>(
  a: K | (() => B),
  b?: () => B
): TFu<A, A & ({ [P in K]: B } | B)> {
  const hasKey = typeof a === 'string';
  const key = hasKey ? (a as K) : null;
  const fn = (hasKey ? b : a) as (() => B);

  return fu((instance) => {
    const initial = hasKey ? ({ [key as K]: fn() } as { [P in K]: B }) : fn();
    const subject = new BehaviorSubject(initial);
    const stream = toStream(fn);
    const subscription = stream.subscribe(
      hasKey
        ? (value) => subject.next({ [key as K]: value } as { [P in K]: B })
        : (value) => subject.next(value)
    );

    return {
      ...combineMerge(
        [instance.initial, initial],
        [instance.subscriber, subject]
      ),
      teardown() {
        subscription.unsubscribe();
      }
    };
  });
}
