import { PublicStore } from './ControllerStore';

export abstract class Controller<S = any, C = any, D = void> {
  private store: PublicStore<S, C>;
  protected dependencies: D;
  public constructor(store: PublicStore<S, C>, dependencies: D) {
    this.store = store;
    this.dependencies = dependencies;
  }
  protected get context(): C {
    return this.store.context;
  }
  protected get state(): S {
    return this.store.state();
  }
  protected get next(): PublicStore<S>['next'] {
    return this.store.next.bind(this.store);
  }
}
