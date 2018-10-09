import create from './create';

export default function collection(...middlewares) {
  const Middlewares = middlewares.map((middleware) => create(middleware));
  return {
    options: { pure: true },
    stream(stream$) {
      this.all = [];

      for (let i = 0; i < Middlewares.length; i++) {
        const Middleware = Middlewares[i];
        const instance = new Middleware(stream$, this, i);
        this.all.push(instance);
        stream$ = instance.out$;
      }

      return this.all[this.all.length - 1].out$;
    },
    mount() {
      this.all.forEach((middleware) => middleware.mount());
    },
    unmount() {
      this.all.forEach((middleware) => middleware.unmount());
    }
  };
}
