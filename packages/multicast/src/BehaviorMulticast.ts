import { SubscriptionObserver } from './SubscriptionObserver';
import { Multicast } from './Multicast';
import { ObservableObserver } from './definitions';
import { Subscription } from './Subscription';

export interface BehaviorMulticastState<T> {
  error?: Error;
  value: T;
  done: boolean;
}

export class BehaviorMulticast<T> extends Multicast<T> {
  public static of<T>(item: T): BehaviorMulticast<T> {
    return new BehaviorMulticast(item, (obs) => {
      obs.complete();
    });
  }
  public static merge<T>(
    multicast: BehaviorMulticast<T>,
    ...multicasts: Array<Multicast<T>>
  ): BehaviorMulticast<T> {
    return new BehaviorMulticast(multicast.state.value, (obs) => {
      let complete = 0;
      const observer = {
        ...obs,
        complete() {
          complete++;
          if (complete === multicasts.length) obs.complete();
        }
      };

      const subscriptions = [multicast.subscribe(observer)];
      for (const multicast of multicasts) {
        subscriptions.push(multicast.subscribe(observer));
      }

      return () => {
        for (const subscription of subscriptions) {
          subscription.unsubscribe();
        }
      };
    });
  }
  public state: BehaviorMulticastState<T>;
  public constructor(
    initial: T,
    subscribe?: (
      this: Multicast<T>,
      observer: SubscriptionObserver<T>
    ) => void | (() => void)
  ) {
    super(function(obs) {
      obs.next(initial);
      if (subscribe) return subscribe.call(this, obs);
    });
  }
  public get value(): T {
    return this.state.value;
  }
  public getValue(): T {
    if (this.state.error) {
      throw this.state.error;
    }
    return this.state.value;
  }
  public subscribe(observer: ObservableObserver<T>): Subscription<T> {
    const subscription = super.subscribe(observer);
    if (!this.state.done && !subscription.closed) {
      if (observer.next) observer.next(this.state.value);
    }
    return subscription;
  }
}
