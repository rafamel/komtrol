export interface Observable<T> {
  subscribe(observer: ObservableObserver<T>): ObservableSubscription;
}

export interface Subject<T> extends Observable<T> {
  next(value: T): void;
  error(error: Error): void;
  complete(): void;
}

export interface ObservableObserver<T> {
  start?(subscription: ObservableSubscription): void;
  next?(value: T): void;
  error?(error: Error): void;
  complete?(): void;
}

export interface ObservableSubscription {
  unsubscribe(): void;
  closed: boolean;
}

export interface ObservableSubscriptionObserver<T> {
  next(value: T): void;
  error(error: Error): void;
  complete(): void;
}
