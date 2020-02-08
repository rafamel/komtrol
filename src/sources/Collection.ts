import { Source } from './Source';
import { CollectionData } from './types';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export class Collection<T extends Record<string, Source>> extends Source<
  CollectionData<T>
> {
  public collection: T;
  public constructor(collection: T) {
    const data = Object.defineProperties(
      {},
      Object.keys(collection).reduce((acc, key): PropertyDescriptorMap => {
        return Object.assign(acc, {
          [key]: {
            enumerable: true,
            get: () => collection[key].data()
          }
        });
      }, {})
    );
    const keys: Array<keyof T> = Object.keys(collection);
    const observable = combineLatest(keys.map((key) => collection[key].$)).pipe(
      map((arr) => {
        return arr.reduce((acc, value, i) => {
          acc[keys[i]] = value;
          return acc;
        }, {});
      })
    );

    super(
      () => data,
      () => observable
    );
    this.collection = collection;
  }
}
