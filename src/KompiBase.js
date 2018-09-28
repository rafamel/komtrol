export default class KompiBase {
  constructor(stream$) {
    this.in$ = stream$;
  }
  get out$() {
    return this.in$;
  }
  init() {}
  stream(stream$) {
    return stream$;
  }
  mount() {}
  unmount() {}
}
