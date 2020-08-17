import { Subscription } from 'rxjs';
import { EmptyUnion } from '../../types';

/* Enable */
export type MachineEnable = EmptyUnion | MachineEnableFn;
export type MachineEnableFn = () => EmptyUnion | MachineDisable;

/* Disable */
export type MachineDisable =
  | EmptyUnion
  | MachineDisableFn
  | Subscription
  | Subscription[];
export type MachineDisableFn = () => EmptyUnion;
