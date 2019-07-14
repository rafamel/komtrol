import { combineLatest } from 'rxjs';
import { map as _map } from 'rxjs/operators';
import { IParentInstance, IFuInstance } from '~/types';

export default function combine<A, B, C extends A>(
  parent: IParentInstance<A>,
  instance: IFuInstance<B>,
  map: (a: A, b: B) => C
): IFuInstance<C> {
  return {
    ...instance,
    initial: map(parent.collect(), instance.initial),
    subscriber: combineLatest(parent.subscriber, instance.subscriber).pipe(
      _map(([a, b]) => map(a, b))
    )
  };
}
