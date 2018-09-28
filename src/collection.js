import KompiBase from './KompiBase';

export default function collection(...kompis) {
  return class Collection extends KompiBase {
    constructor(stream$, collection) {
      super(stream$);

      this.collection = collection || null;

      const getCollection = (i) => ({
        collection: this,
        index: i,
        get all() {
          return this.collection.all;
        },
        get parent() {
          return this.all[i - 1] || null;
        },
        get child() {
          return this.all[i + 1] || null;
        }
      });

      this.all = [];
      for (let i = 0; i < kompis.length; i++) {
        const Kompi = kompis[i];
        const kompi = new Kompi(stream$, getCollection(i));
        this.all.push(kompi);
        stream$ = kompi.out$;
      }
    }
    get out$() {
      return this.all[this.all.length - 1].out$;
    }
    mount() {
      this.all.forEach((kompi) => kompi.mount());
    }
    unmount() {
      this.all.forEach((kompi) => kompi.unmount());
    }
  };
}
