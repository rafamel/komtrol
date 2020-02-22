import { Reporter, Machine, Source } from './definitions';

export type EmptyUnion = void | null | undefined;

export type StateMap<S, T> =
  | StateMapFn<S, T>
  | (S extends T ? EmptyUnion : StateMapFn<S, T>);

export type StateMapFn<S, T> = (state: S) => T;

export type SourcesRecord<T = any> = Record<string, Source<T>>;

export type SourcesRecordCombineState<T extends SourcesRecord> = {
  [P in keyof T]: T[P]['state'];
};

export type ReporterValue<R, K extends keyof Reporter<any>> = R extends Source<
  any
>
  ? InstanceReporterValue<R, K>
  : R extends Record<string, Source<any>>
  ? RecordReporterValue<R, K>
  : never;

export type MachineValue<R, K extends keyof Machine<any>> = R extends Source<
  any
>
  ? InstanceMachineValue<R, K>
  : R extends Record<string, Source<any>>
  ? RecordMachineValue<R, K>
  : never;

export type RecordReporterValue<
  R extends Record<string, Source<any>>,
  K extends keyof Reporter<any>
> = InstanceReporterValue<Extract<R[keyof R], Reporter<any>>, K>;

export type RecordMachineValue<
  R extends Record<string, Source<any>>,
  K extends keyof Machine<any>
> = InstanceMachineValue<Extract<R[keyof R], Machine<any>>, K>;

export type InstanceReporterValue<
  R extends Source<any>,
  K extends keyof Reporter<any>
> = R extends Reporter<any> ? R[K] : never;

export type InstanceMachineValue<
  M extends Source<any>,
  K extends keyof Machine<any>
> = M extends Machine<any> ? M[K] : never;
