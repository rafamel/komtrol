import { Multicast } from './Multicast';
import { Subject } from './definitions';

export class MulticastSubject<T> extends Multicast<T> implements Subject<T> {
  public static of<T>(item: T): MulticastSubject<T> {
    const subject = new MulticastSubject<T>();
    subject.next(item);
    subject.complete();
    return subject;
  }
  public static merge<T>(
    multicast: Multicast<T>,
    ...multicasts: Array<Multicast<T>>
  ): MulticastSubject<T> {
    const obs = super.merge(multicast, ...multicasts);

    let teardown: void | (() => void);
    const subject = new MulticastSubject<T>(() => {
      if (teardown) teardown();
    });
    const subscription = obs.subscribe(subject);
    teardown = subscription.unsubscribe.bind(subscription);

    return subject;
  }
  public constructor(teardown?: () => void) {
    super(() => teardown);
  }
  next(value: T) {
    return this.observer.next(value);
  }
  error(error: Error) {
    return this.observer.error(error);
  }
  complete() {
    return this.observer.complete();
  }
}
