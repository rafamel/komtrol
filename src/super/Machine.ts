import { Machine } from '../definitions';
import { Empty, NullaryFn } from 'type-core';
import { Push } from 'multitude/definitions';
import { Observable, Subject } from 'multitude/push';

export type MachineEnable = Empty | NullaryFn<MachineDisable>;

export type MachineDisable =
  | Empty
  | NullaryFn
  | Push.Subscription
  | Push.Subscription[];

export abstract class MachineEnclosure<D = Empty> {
  #enable: MachineEnable;
  #disable: MachineDisable;
  #subject: Push.Subject<boolean, boolean>;
  #observable: Push.Observable<boolean>;
  protected deps: D;
  protected constructor(deps: D, enable: MachineEnable) {
    this.deps = deps;
    this.#enable = enable;
    this.#disable = null;
    this.#subject = Subject.of(false, { replay: true });
    this.#observable = Observable.from(this.#subject);
  }
  protected get active(): boolean {
    return this.#subject.value;
  }
  protected get active$(): Push.Observable<boolean> {
    return this.#observable;
  }
  /**
   * Sets `active` to `true` and runs the `enable` function
   * passed as a constructor parameter.
   */
  protected enable(): void {
    if (this.active) return;

    const fn = this.#enable;
    if (fn) this.#disable = fn();

    this.#subject.next(true);
  }
  /**
   * Sets `active` to `false`, runs the `disable` function
   * passed as a constructor parameter, if any, and unsubscribes
   * from all subscriptions returned by `enable`, if any.
   */
  protected disable(): void {
    if (!this.active) return;

    const disable = this.#disable;
    if (typeof disable === 'function') {
      disable();
    } else if (Array.isArray(disable)) {
      disable.map((subscription) => subscription.unsubscribe());
    } else if (disable) {
      disable.unsubscribe();
    }

    this.#disable = null;
    this.#subject.next(false);
  }
}

/**
 * A `Machine` implementation as an abstract class.
 */
export abstract class SuperMachine<D = Empty>
  extends MachineEnclosure<D>
  implements Machine {
  public get active(): boolean {
    return super.active;
  }
  public get active$(): Push.Observable<boolean> {
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
  public constructor(enable: MachineEnable) {
    super(null, enable);
  }
}
