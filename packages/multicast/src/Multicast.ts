import { SubscriptionObserver } from './SubscriptionObserver';
import {
  Observable,
  Source,
  Sink,
  SourceSignal,
  SinkSignal,
  Callbag,
  START,
  DATA,
  END,
  ObservableObserver
} from './definitions';
import { Subscription } from './Subscription';

const teardown = Symbol('teardown');

export interface MulticastState<T> {
  error?: Error;
  value?: T;
  done: boolean;
}

export class Multicast<T> implements Observable<T> {
  public static of<T>(item: T): Multicast<T> {
    return new Multicast((obs) => {
      obs.next(item);
      obs.complete();
    });
  }
  public static merge<T>(
    multicast: Multicast<T>,
    ...multicasts: Array<Multicast<T>>
  ): Multicast<T> {
    return new Multicast((obs) => {
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
  private [teardown]: null | (() => void);
  private source: Source<T>;
  protected observer: SubscriptionObserver<T>;
  public state: MulticastState<T>;
  public constructor(
    subscribe?: (
      this: Multicast<T>,
      observer: SubscriptionObserver<T>
    ) => void | (() => void)
  ) {
    let i = 0;
    let record: Record<string, Sink<T>> = {};
    let sinks: Array<Sink<T>> = [];
    this.state = { done: false };
    this.source = (signal: SourceSignal<T>) => {
      if (signal.type !== 0) return;

      if (this.state.done) {
        let complete = false;
        signal.data({
          type: 0,
          data({ type }: SourceSignal<T>) {
            if (type === 2) {
              complete = true;
            }
          }
        });
        if (!complete) {
          signal.data(
            this.state.error
              ? {
                  type: 2,
                  data: this.state.error
                }
              : { type: 2 }
          );
        }
      } else {
        const index = i++;
        record[index] = signal.data;
        sinks = Object.values(record);
        signal.data({
          type: 0,
          data({ type }: SourceSignal<T>) {
            if (type === 2) {
              delete record[index];
              sinks = Object.values(record);
            }
          }
        });
      }
    };

    let subscribeCall = false;
    this.observer = new SubscriptionObserver((signal: SinkSignal<T>) => {
      if (signal.type === 1) {
        this.state.value = signal.data;
      } else if (signal.type === 2) {
        this.state.done = true;
        if (signal.data) this.state.error = signal.data;
        if (subscribeCall) this.teardown();
      }

      for (const sink of sinks) {
        sink(signal);
      }
    });

    this[teardown] =
      (subscribe && subscribe.call(this, this.observer)) || (() => undefined);
    subscribeCall = true;
    if (this.state.done) this.teardown();
  }
  public subscribe(observer: ObservableObserver<T>): Subscription<T> {
    return new Subscription(this.source, observer);
  }
  public teardown(): void {
    const fn = this[teardown];
    if (!fn) return;

    this[teardown] = null;
    if (!this.state.done) {
      this.observer.error(Error(`Teardown occurred before end of stream`));
    }
    fn();
  }
  public asSource(): Source<T> {
    return this.source.bind(this);
  }
  public asCallbag(): Callbag<void, T> {
    return (
      type: START | DATA | END,
      data?: Callbag<T, void> | void | Error
    ): void => {
      if (type === 0 && typeof data === 'function') {
        return this.source({
          type: 0,
          data(signal: SinkSignal<T>): void {
            return signal.type === 0
              ? data(signal.type, (type, data) => {
                  if (type === 0) return;
                  return signal.data({ type, data } as SourceSignal<T>);
                })
              : data(signal.type, signal.data);
          }
        });
      }
      return this.source({ type, data } as SourceSignal<T>);
    };
  }
}
