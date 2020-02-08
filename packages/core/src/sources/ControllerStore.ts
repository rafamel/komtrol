import { Store } from './Store';
import { PublicStore } from './types';

export class ControllerStore<S = void, C = void> extends Store<S>
  implements PublicStore<S, C> {
  public context: C;
  public constructor(state: S, context: C) {
    super(state);
    this.context = context;
  }
}
