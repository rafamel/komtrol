import Kompi from './Kompi';

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
        const kompi = new Kompi(middleware, getCollection(i));
        kompi.provide(stream$);
        all.push(kompi);
        stream$ = kompi.out$;
      }

      this.all = all;
      return all[all.length - 1].out$;
    },
    mount() {
      this.all.forEach((kompi) => kompi.mount());
    },
    unmount() {
      this.all.forEach((kompi) => kompi.unmount());
    }
  };
}
