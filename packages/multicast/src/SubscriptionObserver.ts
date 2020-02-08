import { ObservableSubscriptionObserver, Sink } from './definitions';

const done = Symbol('done');

export class SubscriptionObserver<T>
  implements ObservableSubscriptionObserver<T> {
  private sink: Sink<T>;
  private [done]: boolean;
  public constructor(sink: Sink<T>) {
    this.sink = sink;
    this[done] = false;
  }
  public get done(): boolean {
    return this[done];
  }
  public next(value: T): void {
    if (this.done) return;
    this.sink({ type: 1, data: value });
  }
  public error(error: Error): void {
    if (this.done) return;

    this[done] = true;
    this.sink({ type: 2, data: error });
  }
  public complete(): void {
    if (this.done) return;

    this[done] = true;
    this.sink({ type: 2 });
  }
}
