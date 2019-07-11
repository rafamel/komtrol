import { Observable } from 'rxjs';

export type TFu<A, B extends A> = (
  instance: Required<IFuInstance<A>>
) => Required<IFuInstance<B>>;

export type TFuInitialize<A, B extends A> = (
  instance: Required<IFuInstance<A>>
) => IFuInstance<B>;

export type TEmptyFuInstance = Required<IFuInstance<{}>>;

export interface IFuInstance<T> {
  initial?: T;
  subscriber?: Observable<T>;
  teardown?: () => void;
}

export interface IFuInstanceExtend<A, B, C extends A = A & B>
  extends IFuInstance<B> {
  initial: B;
  subscriber: Observable<B>;
  map?: (a: A, b: B) => C;
}

export interface IFuInstanceStateful<A, B, C extends A = A & B> {
  map?: (a: A, b: B) => C;
  teardown?: () => void;
}
