import { Observable } from 'rxjs';

export type TUnion<A extends object, B> = B extends void ? A : A & B;

export type TSignal = 'initial' | 'next' | 'emit';

/* Pipeline */
export interface IInstance<T extends object> {
  initial: T;
  subscriber: Observable<T>;
  teardown?: () => void;
}
export interface IParentInstance<T extends object> {
  initial: T;
  subscriber: Observable<T>;
}
export interface IFuseInstance<T extends object> {
  initial: T;
  subscriber: Observable<T>;
  teardown: () => void;
}

export interface IProviderInstance<A extends object, T> {
  execute(self: A, signal: TSignal): T;
  teardown?: () => void;
}
export interface IFuseProviderInstance<A extends object, T> {
  execute(self: A, signal: TSignal): T;
  teardown?: () => void;
  subscriber?: Observable<void>;
}

export type TIntermediate<A extends object, T> = [
  IFuseInstance<A>,
  IFuseProviderInstance<A, T>
];

/* Abstracts */
export type TFu<A extends object, B extends object | void, T> = (
  intermediate: TIntermediate<A, B>
) => TIntermediate<TUnion<A, B>, Readonly<T>>;
export type TIntercept<
  A extends object,
  B extends object | void,
  T extends object
> = (intermediate: TIntermediate<A, B>) => TIntermediate<Readonly<T>, void>;

export type TFn<A extends object, B, T> = (
  self: TUnion<A, B>,
  collect: TCollect<TUnion<A, B>>
) => T;
export type TTransform<A extends object, B, T> = (
  intermediate: TIntermediate<A, B>
) => TIntermediate<A, Readonly<T>>;

/* Utils */
export type TCollect<T> = () => T;
export type TPolicy<A, B> =
  | boolean
  | null
  | ((collect: TCollect<A>) => (next: B, current: B) => boolean);
export type TUpdatePolicy<A extends object, B extends object | void> =
  | boolean
  | null
  | ((
      collect: TCollect<TUnion<A, B>>
    ) => (next: TUnion<A, B>, self: TUnion<A, B>) => boolean);
