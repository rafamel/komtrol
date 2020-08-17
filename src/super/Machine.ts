import { Observable, BehaviorSubject } from 'rxjs';
import { Machine, MachineEnable, MachineDisable } from './definitions';
import { EmptyUnion } from '../types';

const _enable = Symbol('enable');
const _disable = Symbol('disable');
const _active = Symbol('active');

export abstract class MachineEnclosure<D = EmptyUnion> {
  private [_enable]: MachineEnable;
  private [_disable]: MachineDisable;
  private [_active]: BehaviorSubject<boolean>;
  protected deps: D;
  protected constructor(deps: D, enable: MachineEnable) {
    this.deps = deps;
    this[_enable] = enable;
    this[_disable] = null;
    this[_active] = new BehaviorSubject<boolean>(false);
  }
  /**
   * Whether there are tasks in the queue currently executing.
   */
  protected get active(): boolean {
    return this[_active].value;
  }
  /**
   * Observable streaming changes in `instance.busy`.
   */
  protected get active$(): Observable<boolean> {
    return this[_active].asObservable();
  }
  /**
   * Sets `active` to `true` and runs the `enable` function
   * passed as a constructor parameter.
   */
  protected enable(): void {
    if (this[_active].value) return;

    const fn = this[_enable];
    if (fn) this[_disable] = fn();

    this[_active].next(true);
  }
  /**
   * Sets `active` to `false`, runs the `disable` function
   * passed as a constructor parameter, if any, and unsubscribes
   * from all subscriptions returned by `enable`, if any.
   */
  protected disable(): void {
    if (!this[_active].value) return;

    const disable = this[_disable];
    if (typeof disable === 'function') {
      disable();
    } else if (Array.isArray(disable)) {
      disable.map((subscription) => subscription.unsubscribe());
    } else if (disable) {
      disable.unsubscribe();
    }

    this[_disable] = null;
    this[_active].next(false);
  }
}

/**
 * A `Machine` implementation as an abstract class.
 */
export abstract class SuperMachine<D = EmptyUnion> extends MachineEnclosure<D>
  implements Machine {
  public get active(): boolean {
    return super.active;
  }
  public get active$(): Observable<boolean> {
    return super.active$;
  }
  public enable(): void {
    super.enable();
  }
  public disable(): void {
    super.disable();
  }
}

export class MachineSubject extends SuperMachine implements Machine {
  public constructor(enable?: MachineEnable) {
    super(null, enable);
  }
}
