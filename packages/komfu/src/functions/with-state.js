export default function withState(name, setterName, initialState) {
  return {
    init() {
      this.value = initialState;
    },
    change(props, providers) {
      return this.send();
    },
    methods: {
      send() {
        return this.next({ [name]: this.value, [setterName]: this.setValue });
      },
      setValue(value) {
        this.value = value;
        this.send();
      }
    }
  };
}
