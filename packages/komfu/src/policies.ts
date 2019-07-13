import { TUpdatePolicy } from './types';
import { shallowEqual as equal } from 'shallow-equal-object';
import { shallowEqualProps as equalProps } from 'shallow-equal-props';

export function compares<A extends object>(
  comparison: (self: A, next: A) => boolean
): TUpdatePolicy<A> {
  return () => comparison;
}

export function depends<A extends object>(
  dependencies: (self: A) => any[]
): TUpdatePolicy<A> {
  return () => {
    let last: any[];
    return (self, next) => {
      if (!last) last = dependencies(self);
      const current = dependencies(next);
      const shouldUpdate = !equal(last, current);
      last = current;
      return shouldUpdate;
    };
  };
}

export function reacts<A extends object>(
  dependencies: (self: A) => any[]
): TUpdatePolicy<A> {
  return () => {
    let last: any[];
    return (self, next) => {
      if (!last) last = dependencies(self);
      const current = dependencies(next);
      const shouldUpdate = !equalProps(last, current);
      last = current;
      return shouldUpdate;
    };
  };
}
