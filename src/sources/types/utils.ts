export type EmptyUnion = void | null | undefined;

export type StateMap<S, T> =
  | StateMapFn<S, T>
  | (S extends T ? EmptyUnion : StateMapFn<S, T>);

export type StateMapFn<S, T> = (state: S) => T;
