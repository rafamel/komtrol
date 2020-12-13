import { Source } from '../definitions';
import { Members } from 'type-core';
import { Push } from 'multitude/definitions';
import { combine } from 'multitude/push';

export declare namespace Combine {
  export type States<T extends Members<Source>> = {
    [P in keyof T]: T[P]['state'];
  };
}

export class Combine {
  /**
   * Combines the `state` of a number of sources.
   */
  public static states<T extends Members<Source>>(
    sources: T
  ): Combine.States<T> {
    return Object.entries(sources).reduce((acc: any, [key, value]) => {
      acc[key] = value.state;
      return acc;
    }, {});
  }
  /**
   * Combines the `state$` of a number of sources.
   */
  public static states$<T extends Members<Source>>(
    sources: T
  ): Push.Observable<Combine.States<T>> {
    const states = Object.entries(sources).reduce((acc: any, [key, value]) => {
      acc[key] = value.state$;
      return acc;
    }, {});

    return combine(states) as Push.Observable<Combine.States<T>>;
  }
}
