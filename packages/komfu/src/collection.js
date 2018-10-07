import Komfu from './Komfu';

export default function collection(...middlewares) {
  return {
    options: {
      pure: true
    },
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
        const middleware = middlewares[i];
        const komfu = new Komfu(middleware, getCollection(i));
        komfu.provide(stream$);
        all.push(komfu);
        stream$ = komfu.out$;
      }

      this.all = all;
      return all[all.length - 1].out$;
    },
    mount() {
      this.all.forEach((komfu) => komfu.mount());
    },
    unmount() {
      this.all.forEach((komfu) => komfu.unmount());
    }
  };
}
