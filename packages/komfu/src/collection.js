import { PureKomfu } from '~/Komfu';

export default function collection(...middlewares) {
  return class Collection extends PureKomfu {
    stream(stream$) {
      const all = [];

      const getCollection = (i) => ({
        all,
        index: i,
        get parent() {
          return this.collection[i - 1] || null;
        },
        get child() {
          return this.collection[i + 1] || null;
        }
      });

      for (let i = 0; i < middlewares.length; i++) {
        const Middleware = middlewares[i];
        const middleware = new Middleware(getCollection(i));
        middleware.provide(stream$);
        all.push(middleware);
        stream$ = middleware.out$;
      }

      this.all = all;
      return all[all.length - 1].out$;
    }
    mount() {
      this.all.forEach((middleware) => middleware.mount());
    }
    unmount() {
      this.all.forEach((middleware) => middleware.unmount());
    }
  };
}
