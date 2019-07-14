import { Observable } from 'rxjs';

export type TFu<A extends object, B extends object> = (
  instance: IPureInstance<A>
) => IPureInstance<Readonly<B>>;

export interface IPureInstance<T> {
  initial: T;
  subscriber: Observable<T>;
  teardown: () => void;
}

export interface IParentInstance<T> {
  collect: TCollect<T>;
  subscriber: Observable<T>;
}

export interface IFuInstance<T> {
  initial: T;
  subscriber: Observable<T>;
  teardown?: () => void;
}

export interface IExtendInstance<A extends object, B, C extends A = A & B> {
  initial: B;
  subscriber: Observable<B>;
  teardown?: () => void;
  map?: (a: A, b: B) => C;
}

export interface IStatefulInstance<A extends object, B, C extends A = A & B> {
  map?: (a: A, b: B) => C;
  teardown?: () => void;
}

export type TFn<A, T> = (self: A, collect: TCollect<A>) => T;
export type TUpdatePolicy<T> = boolean | null | TUpdatePolicyFn<T>;
export type TUpdatePolicyFn<T> = () => (self: T, next: T) => boolean;
export type TCollect<T> = () => T;
