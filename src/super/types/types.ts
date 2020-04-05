import { Subscription } from 'rxjs';
import { EmptyUnion } from '../../types';

/* Enable */
export type Enable = EmptyUnion | EnableFn;
export type EnableFn = () => EmptyUnion | Subscription | Subscription[];

/* Disable */
export type Disable = EmptyUnion | DisableFn;
export type DisableFn = () => EmptyUnion;

/* StateMap */
export type StateMap<S, T> =
  | StateMapFn<S, T>
  | (S extends T ? EmptyUnion : StateMapFn<S, T>);
export type StateMapFn<S, T> = (state: S) => T;
