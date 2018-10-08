import { PureKomfu } from '~/Komfu';

export class Collection {
  constructor(all, i) {
    this.all = all;
    this.index = i;
  }
  get parent() {
    return this.all[this.index - 1] || null;
  }
  get child() {
    return this.all[this.index + 1] || null;
  }
}

export default function collection(...middlewares) {
  return class CollectionMiddleware extends PureKomfu {
    stream(stream$) {
      const all = [];

      for (let i = 0; i < middlewares.length; i++) {
        const Middleware = middlewares[i];
        const middleware = new Middleware(new Collection(all, i));
        middleware.provide(stream$);
        all.push(middleware);
        stream$ = middleware.out$;
      }

      this.all = all;
      return all[all.length - 1].out$;
    }
    onMount() {
      this.all.forEach((middleware) => middleware.mount());
    }
    onUnmount() {
      this.all.forEach((middleware) => middleware.unmount());
    }
  };
}
