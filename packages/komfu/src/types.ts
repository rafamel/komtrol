import { Observable } from 'rxjs';

export type TFu<A extends object, B extends object> = (
  instance: Required<IFuInstance<A>>
) => Required<IFuInstance<Readonly<B>>>;

export type TFuInitialize<A extends object, B extends object> = (
  instance: Required<IFuInstance<A>>
) => IFuInstance<B>;

export type TEmptyFuInstance = Required<IFuInstance<{}>>;

export interface IFuInstance<T> {
  initial?: T;
  subscriber?: Observable<T>;
  teardown?: () => void;
}

export interface IFuInstanceExtend<A extends object, B, C extends A = A & B>
  extends IFuInstance<B> {
  initial: B;
  subscriber: Observable<B>;
  map?: (a: A, b: B) => C;
}

export interface IFuInstanceStateful<A extends object, B, C extends A = A & B> {
  map?: (a: A, b: B) => C;
  teardown?: () => void;
}
