import { stateful } from '~/abstracts';
import { TFu } from '~/types';
import { mapTo } from '~/utils';

export interface IBreakpoints {
  [key: string]: number | string;
}

export type TActiveBreakpoints<T extends IBreakpoints> = {
  [K in keyof T]: boolean;
};

export default withBreakpoints;

function withBreakpoints<A, T extends IBreakpoints>(
  breakpoints: T
): TFu<A, A & TActiveBreakpoints<T>>;
function withBreakpoints<A, T extends IBreakpoints, K extends string>(
  key: K,
  breakpoints: T
): TFu<A, A & { [P in K]: TActiveBreakpoints<T> }>;

function withBreakpoints<A, T extends IBreakpoints, K extends string>(
  a: K | T,
  b?: T
): TFu<A, A & (TActiveBreakpoints<T> | { [P in K]: TActiveBreakpoints<T> })> {
  const key = b ? (a as K) : null;
  const breakpoints = b || (a as T);
  const mapper = mapTo<A, TActiveBreakpoints<T>, K>(key);

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

  return stateful(calculate, (state) => {
    let timeout: NodeJS.Timer | null = null;
    const listener = (): void => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        const active = calculate();
        if (active !== state.current) state.set(active);
      }, 100);
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
