import { TPolicy } from './types';
import { shallowEqual as shallow } from 'shallow-equal-object';

export { collects, compares, depends };

function collects<A, B>(fn: (next: B, self: A) => boolean): TPolicy<A, B> {
  return (collect) => (next) => fn(next, collect());
}

function compares<T extends object>(
  comparison: (next: T, current: T) => boolean
): TPolicy<any, T> {
  return () => comparison;
}

function depends<T extends object>(
  equal: (next: any[], self: any[]) => boolean,
  dependencies: (current: T) => any[]
): TPolicy<any, T>;
function depends<T extends object>(
  dependencies: (current: T) => any[]
): TPolicy<any, T>;
function depends<T extends object>(
  a: ((next: any[], current: any[]) => boolean) | ((current: T) => any[]),
  b?: (current: T) => any[]
): TPolicy<any, T> {
  const equal = (b ? a : shallow) as ((next: any[], self: any[]) => boolean);
  const dependencies = (b || a) as ((current: T) => any[]);
  return () => {
    let last: any[];
    return (next, self) => {
      if (!last) last = dependencies(self);
      const nextDeps = dependencies(next);
      const shouldUpdate = !equal(nextDeps, last);
      last = nextDeps;
      return shouldUpdate;
    };
  };
}
