import { stateful } from '~/abstracts';
import { TFu } from '~/types';
import { mapTo } from '~/utils';
import { shallowEqualProps as equal } from 'shallow-equal-props';

export interface IBreakpoints {
  [key: string]: number | string;
}

export type TActiveBreakpoints<T extends IBreakpoints> = {
  [K in keyof T]: boolean;
};

export default withBreakpoints;

function withBreakpoints<A extends object, T extends IBreakpoints>(
  breakpoints: T
): TFu<A, A & TActiveBreakpoints<T>>;
function withBreakpoints<
  A extends object,
  T extends IBreakpoints,
  U extends object
>(breakpoints: T, map: (active: TActiveBreakpoints<T>) => U): TFu<A, A & U>;
function withBreakpoints<
  A extends object,
  T extends IBreakpoints,
  K extends string
>(key: K, breakpoints: T): TFu<A, A & { [P in K]: TActiveBreakpoints<T> }>;
function withBreakpoints<
  A extends object,
  T extends IBreakpoints,
  U,
  K extends string
>(
  key: K,
  breakpoints: T,
  map: (active: TActiveBreakpoints<T>) => U
): TFu<A, A & { [P in K]: U }>;

function withBreakpoints<
  A extends object,
  T extends IBreakpoints,
  U,
  K extends string
>(
  a: K | T,
  b?: T | ((active: TActiveBreakpoints<T>) => U),
  c?: (active: TActiveBreakpoints<T>) => U
): TFu<
  A,
  A & (TActiveBreakpoints<T> | U | { [P in K]: TActiveBreakpoints<T> | U })
> {
  const hasKey = typeof a === 'string';
  const key = hasKey ? (a as K) : null;
  const breakpoints = (hasKey ? b : a) as T;
  const map = hasKey ? c : (b as (active: TActiveBreakpoints<T>) => U);
  const mapper = mapTo<A, TActiveBreakpoints<T> | U, K>(key);

  const arr = Object.entries(breakpoints)
    .map(([name, value]): [keyof T, number] => [name, parseInt(String(value))])
    .sort((a, b) => a[1] - b[1]);

  // @ts-ignore
  const w: any = typeof window !== 'undefined' && window;
  if (!w) throw Error(`withBreakpoint must be run in the browser`);

  function calculate(): TActiveBreakpoints<T> {
    const width = w.innerWidth;
    const active: Partial<TActiveBreakpoints<T>> = {};
    for (let [name, value] of arr) {
      active[name] = width >= value;
    }
    return active as TActiveBreakpoints<T>;
  }

  const get: () => TActiveBreakpoints<T> | U = map
    ? () => map(calculate())
    : calculate;

  return stateful(get(), (state) => {
    let timeout: NodeJS.Timer | null = null;
    const listener = (): void => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        const value = get();
        if (typeof value === 'object' && value !== null) {
          if (!equal(value, state.current)) state.set(value);
        } else {
          if (value !== state.current) state.set(value);
        }
      }, 150);
    };

    w.addEventListener('resize', listener);
    return {
      map: mapper,
      teardown() {
        return w.removeEventListener('resize', calculate);
      }
    };
  });
}
