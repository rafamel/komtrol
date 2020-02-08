export type START = 0;
export type DATA = 1;
export type END = 2;

export type Source<T> = Multibag<void, T>;
export type SourceSignal<T> = Signal<void, T>;
export type Sink<T> = Multibag<T, void>;
export type SinkSignal<T> = Signal<T, void>;

export type Multibag<I, O> = (signal: Signal<I, O>) => void;

export type Signal<I, O> =
  | { type: START; data: Multibag<O, I> }
  | { type: DATA; data: I }
  | { type: END; data?: Error };

export type Callbag<I, O> = (
  type: START | DATA | END,
  data?: Callbag<O, I> | I | Error
) => void;
