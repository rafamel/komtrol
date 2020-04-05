import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { Machine, Enable, Disable } from './types';
import { EmptyUnion } from '../types';

const fns = Symbol('fns');
const active = Symbol('active');
const subscriptions = Symbol('subscriptions');

/**
 * A `Machine` implementation as an abstract class.
 */
export abstract class SuperMachine<D = EmptyUnion> implements Machine {
  private [fns]: [Enable, Disable];
  private [active]: BehaviorSubject<boolean>;
  private [subscriptions]: Subscription[];
  protected deps: D;
  protected constructor(deps: D, enable: Enable, disable: Disable) {
    this.deps = deps;
    this[fns] = [enable, disable];
    this[active] = new BehaviorSubject<boolean>(false);
    this[subscriptions] = [];
  }
  /**
   * Whether there are tasks in the queue currently executing.
   */
  public get active(): boolean {
    return this[active].value;
  }
  /**
   * Observable streaming changes in `instance.busy`.
   */
  public get active$(): Observable<boolean> {
    return this[active].asObservable();
  }
  /**
   * Sets `active` to `true` and runs the `enable` function
   * passed as a constructor parameter.
   */
  public enable(): void {
    if (this[active].value) return;

    const fn = this[fns][0];
    if (fn) {
      const response = fn();
      if (response) {
        this[subscriptions] = this[subscriptions].concat(response);
      }
    }

    this[active].next(true);
  }
  /**
   * Sets `active` to `false`, runs the `disable` function
   * passed as a constructor parameter, if any, and unsubscribes
   * from all subscriptions returned by `enable`, if any.
   */
  public disable(): void {
    if (!this[active].value) return;

    const fn = this[fns][1];
    if (fn) fn();
    this[subscriptions].map((subscription) => subscription.unsubscribe());
    this[subscriptions] = [];

    this[active].next(false);
  }
}

export class MachineSubject extends SuperMachine implements Machine {
  public constructor(enable?: Enable, disable?: Disable) {
    super(null, enable, disable);
  }
}
