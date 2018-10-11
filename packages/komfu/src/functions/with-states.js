// withState({ prop1: 'Initial val', prop2: '2nd Initial val' });
export default function withStates(obj) {
  return {
    init() {
      this.all = Object.keys(obj).reduce((acc, key) => {
        acc[key] = {
          value: obj[key],
          set: (value) => {
            this.all[key].value = value;
            this.send();
          }
        };
        return acc;
      }, {});
    },
    change() {
      return this.send();
    },
    methods: {
      send() {
        return this.next(this.all);
      }
    }
  };
}
