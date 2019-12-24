import { Store } from '../Store';

export interface PublicStore<S = void, C = void> {
  context: C;
  state(): S;
  next(state?: Partial<S>): void;
}

export class ControllerStore<S = void, C = void> extends Store<S>
  implements PublicStore<S, C> {
  public context: C;
  public constructor(state: S, context: C) {
    super(state);
    this.context = context;
  }
  public next(state?: Partial<S>): void {
    return super.next(state);
  }
}
