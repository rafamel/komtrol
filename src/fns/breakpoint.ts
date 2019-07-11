import fu from '~/fu';
import { TFu } from '~/types';
import { createState } from '~/utils';

export interface IBreakpoints {
  [key: string]: number | string;
}

export default withBreakpoint;

function withBreakpoint<A, T extends IBreakpoints>(
  breakpoints: T
): TFu<A, A & { breakpoint: (keyof T) | null }>;
function withBreakpoint<A, T extends IBreakpoints, K extends string>(
  key: K,
  breakpoints: T
): TFu<A, A & { [P in K]: (keyof T) | null }>;

function withBreakpoint<
  A,
  T extends IBreakpoints,
  K extends string = 'breakpoint'
>(a: K | T, b?: T): TFu<A, A & { [P in K]: (keyof T) | null }> {
  const key = b ? (a as K) : 'breakpoint';
  const breakpoints = b || (a as T);

  const arr = Object.entries(breakpoints)
    .map(([name, value]): [keyof T, number] => [name, parseInt(String(value))])
    .sort((a, b) => a[1] - b[1]);

  // @ts-ignore
  const w: any = typeof window !== 'undefined' && window;
  if (!w) throw Error(`withBreakpoint must be run in the browser`);

  return fu((instance) => {
    function calculate(): (keyof T) | null {
      const width = w.innerWidth;
      for (let [name, value] of arr) {
        if (width >= value) return name;
      }
      return null;
    }

    const stateful = createState(key, calculate(), instance);

    let timeout: NodeJS.Timer | null = null;
    const listener = (): void => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        const res = calculate();
        if (res !== stateful.subject.value) stateful.set(res);
      }, 100);
    };

    w.addEventListener('resize', listener);
    return {
      ...stateful.instance,
      teardown() {
        return w.removeEventListener('resize', calculate);
      }
    };
  });
}
