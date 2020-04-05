import { Source } from '../super';

export type SourceRecord<T extends Source<any> = Source<any>> = Record<any, T>;

export type SourceRecordStates<T extends SourceRecord> = {
  [P in keyof T]: T[P]['state'];
};
