export interface StoreInternal<S = void, T = void> {
  state: Readonly<S>;
  subscriptions: Array<StoreSubscriptionFn<T>>;
}

export type StoreSubscriptionFn<T> = (state: T) => void;

export class Store<S = void> {
  private internal: StoreInternal<S, ReturnType<this['state']>>;
  public constructor(state: S) {
    this.internal = { state, subscriptions: [] };
  }
  public state = (): S => this.internal.state;
  protected next(state?: Partial<S>): void {
    const internal = this.internal;

    if (state !== undefined) {
      internal.state =
        typeof state === 'object' && state !== null
          ? { ...internal.state, ...state }
          : state;
    }

    const value = this.state() as ReturnType<this['state']>;
    for (const fn of internal.subscriptions) {
      fn(value);
    }
  }
  public subscribe(fn: StoreSubscriptionFn<ReturnType<this['state']>>): void {
    const internal = this.internal;

    this.unsubscribe(fn);
    internal.subscriptions.push(fn);
  }
  public unsubscribe(fn: StoreSubscriptionFn<ReturnType<this['state']>>): void {
    const internal = this.internal;

    internal.subscriptions = internal.subscriptions.filter((x) => x !== fn);
  }
}
