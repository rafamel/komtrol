import { TFu } from '~/types';
import { stateful } from '~/abstracts';
import pipe from '~/pipe';
import { key, map } from '~/transforms';
import { createCache } from '~/utils';
import { shallowEqual as equal } from 'shallow-equal-object';

export interface IBreakpoints {
  [key: string]: number | string;
}

export type TActiveBreakpoints<T extends IBreakpoints> = {
  [K in keyof T]: boolean;
};

export default withBreakpoints;

/* Declarations */
function withBreakpoints<
  A extends object,
  B extends object | void,
  T extends IBreakpoints,
  U extends object = TActiveBreakpoints<T>
>(breakpoints: T, map?: (active: TActiveBreakpoints<T>) => U): TFu<A, B, U>;
function withBreakpoints<
  A extends object,
  B extends object | void,
  T extends IBreakpoints,
  K extends string,
  U = TActiveBreakpoints<T>
>(
  key: K,
  breakpoints: T,
  map?: (active: TActiveBreakpoints<T>) => U
): TFu<A, B, { [P in K]: U }>;

/* Implementation */
function withBreakpoints(a: any, b?: any, c?: any): any {
  if (typeof a === 'string') {
    return c === undefined
      ? pipe.f(trunk(b), key(a))
      : pipe.f(trunk(b), map(c), key(a));
  } else {
    return b === undefined ? trunk(a) : pipe.f(trunk(a), map(b));
  }
}

export function trunk<
  A extends object,
  B extends object | void,
  T extends IBreakpoints
>(breakpoints: T): TFu<A, B, TActiveBreakpoints<T>> {
  const arr = Object.entries(breakpoints)
    .map(([name, value]): [keyof T, number] => [name, parseInt(String(value))])
    .sort((a, b) => a[1] - b[1]);

  // @ts-ignore
  const w: any = typeof window !== 'undefined' && window;
  if (!w) throw Error(`withBreakpoints must be run in the browser`);

  function calculate(): TActiveBreakpoints<T> {
    const width = w.innerWidth;
    const active: Partial<TActiveBreakpoints<T>> = {};
    for (let [name, value] of arr) {
      active[name] = width >= value;
    }
    return active as TActiveBreakpoints<T>;
  }

  return stateful((collect, emit) => {
    const cache = createCache(calculate());
    let timeout: NodeJS.Timer | null = null;

    const listener = (): void => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        const value = calculate();
        if (!equal(value, cache.collect())) {
          cache.set(value);
          emit();
        }
      }, 150);
    };

    w.addEventListener('resize', listener);
    return {
      execute: () => cache.collect(),
      teardown: () => w.removeEventListener('resize', listener)
    };
  });
}
