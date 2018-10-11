import parseOpts from '~/parse-opts';

// TODO: as pure middleware
const NO_LAST = {};
export default function withObservable(...args) {
  const [opts, [cb]] = parseOpts({
    args,
    defaults: { as: null, wait: true },
    string: 'as'
  });

  return {
    init(...all) {
      this.last = NO_LAST;
      // eslint-disable-next-line standard/no-callback-literal
      this.obs$ = cb(...all);
    },
    change(props) {
      if (!opts.wait || this.last !== NO_LAST) {
        this.next({ ...props, ...this.last });
      }
    },
    mount() {
      this.subscription = this.obs$.subscribe((x) => {
        this.last = opts.as ? { [opts.as]: x } : x;
        this.next(this.last);
      });
    },
    unmount() {
      this.subscription.unsubscribe();
      this.last = NO_LAST;
    }
  };
}
