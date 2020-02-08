import {
  ObservableSubscription,
  Source,
  ObservableObserver
} from './definitions';

const start = Symbol('start');
const closed = Symbol('closed');

export class Subscription<T> implements ObservableSubscription {
  private [start]: boolean;
  private [closed]: boolean;
  private talkback: Source<T>;
  public constructor(source: Source<T>, observer: ObservableObserver<T>) {
    this[start] = false;
    this[closed] = false;
    this.talkback = source;
    source({
      type: 0,
      data: (signal) => {
        if (signal.type === 0) {
          if (this.start) return;
          this[start] = true;
          this.talkback = signal.data;
          if (observer.start) observer.start(this);
        } else if (signal.type === 1) {
          if (!this.start || this.closed) return;
          if (observer.next) observer.next(signal.data);
        } else if (signal.type === 2) {
          if (!this.start || this.closed) return;
          if (signal.data) {
            if (observer.error) observer.error(signal.data);
          } else {
            if (observer.complete) observer.complete();
          }
        }
      }
    });
  }
  public get start() {
    return this[start];
  }
  public get closed() {
    return this[closed];
  }
  public unsubscribe(): void {
    this[closed] = true;
    this.talkback({ type: 2 });
  }
}
