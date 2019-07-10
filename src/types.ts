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
