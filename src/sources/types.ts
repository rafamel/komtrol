import { Source } from './Source';

export type SourceData<T extends Source> = ReturnType<T['data']>;

export type CollectionData<T extends Record<string, Source>> = {
  [P in keyof T]: SourceData<T[P]>;
};

export interface PublicStore<S = void, C = void> {
  context: C;
  data(): S;
  next(state?: Partial<S>): void;
}
