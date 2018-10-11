import parseOpts from '~/parse-opts';

export default function withProps(...args) {
  const [opts, [cb]] = parseOpts({
    args,
    defaults: { as: null, change: true },
    string: 'as'
  });

  return {
    init(...args) {
      if (!opts.change) {
        // eslint-disable-next-line standard/no-callback-literal
        this.state = opts.as ? { [opts.as]: cb(...args) } : cb(...args);
      }
    },
    change(...args) {
      if (opts.change) {
        // eslint-disable-next-line standard/no-callback-literal
        this.state = opts.as ? { [opts.as]: cb(...args) } : cb(...args);
      }
      this.next(this.state);
    }
  };
}
