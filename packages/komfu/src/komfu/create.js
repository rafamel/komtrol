import provide from './provide';

export default function create(middleware = {}) {
  const Middleware = function() {};
  const descriptors = Object.entries(
    Object.getOwnPropertyDescriptors(middleware.methods || {})
  ).reduce((acc, [key, descriptor]) => {
    acc[key] = {
      get: function() {
        return descriptor.value.bind(this);
      },
      enumerable: true
    };
    return acc;
  }, {});
  Middleware.prototype = Object.defineProperties(
    Object.assign({}, middleware),
    descriptors
  );

  const options = middleware.options || {};

  return class Komfu extends Middleware {
    constructor(in$, collection, index) {
      super();

      this.pure = Boolean(options.pure);
      this.initialized = this.pure;
      this.pending = false;

      this.collection = collection || null;
      this.index = index || null;

      this.pure ? provide.pure.call(this, in$) : provide.komfu.call(this, in$);
    }
    stream(stream$) {
      return super.stream ? super.stream(stream$) : stream$;
    }
    init(...all) {
      if (this.initialized) return false;

      const ans = super.init ? super.init(...all) : false;
      this.initialized = true;
      if (this.pending) this.mount();
      return ans;
    }
    change(props, ...other) {
      return super.change
        ? super.change(props, ...other)
        : this.next(props, { merge: false });
    }
    mount() {
      if (!super.mount) return false;
      if (!this.initialized) return (this.pending = true) && false;
      return super.mount();
    }
    unmount() {
      if (!super.unmount) return false;
      if (this.pending) return (this.pending = false);
      return super.unmount();
    }
    get parent() {
      if (!this.collection) return null;
      return this.collection.all[(this.index || 0) - 1] || null;
    }
    get child() {
      if (!this.collection) return null;
      return this.collection.all[(this.index || 0) + 1] || null;
    }
  };
}
