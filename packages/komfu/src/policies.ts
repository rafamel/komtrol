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
      return !equal(last, dependencies(next));
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
      return !equalProps(last, dependencies(next));
    };
  };
}
