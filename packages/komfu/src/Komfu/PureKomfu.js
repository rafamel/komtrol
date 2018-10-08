const ERR = {
  NOT_PROVIDED: new Error(
    "Komfu instance hasn't been provided for yet: komfu.provide(in$)."
  ),
  NOT_INITIALIZED: new Error('Komfu instance has not been initialized yet.')
};

export default class PureKomfu {
  constructor(collection) {
    this.collection = collection || null;
  }
  get in$() {
    throw ERR.NOT_PROVIDED;
  }
  set in$(value) {
    Object.defineProperty(this, 'in$', { value });
  }
  get out$() {
    throw ERR.NOT_PROVIDED;
  }
  set out$(value) {
    Object.defineProperty(this, 'out$', { value });
  }
  stream(stream$) {
    return stream$;
  }
  init() {}
  onChange(props, providers) {
    this.next(props);
  }
  onMount() {}
  onUnmount() {}
  // Internal
  provide(in$) {
    this.in$ = in$;
    const stream$ = this.stream(in$);
    this.out$ = stream$;

    return this;
  }
  mount() {
    this.onMount();
  }
  unmount() {
    this.onUnmount();
  }
}
