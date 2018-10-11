import parseOpts from '~/parse-opts';
import { Subject } from 'rxjs';

// TODO: as pure middleware
export default function withObservable(...args) {
  const [opts, [cb]] = parseOpts({
    args,
    defaults: { as: null, wait: true },
    string: 'as'
  });

  return {
    init() {
      this.last = {};
      this.subject = new Subject();
      // eslint-disable-next-line standard/no-callback-literal
      this.obs$ = cb(this.subject.asObservable());
    },
    change(...all) {
      this.subject.next(...all);

      if (!opts.wait) {
        const [props] = all;
        this.next({ ...props, ...this.last });
      }
    },
    mount(...all) {
      this.subscription = this.obs$.subscribe((x) => {
        this.last = opts.as ? { [opts.as]: x } : x;
        this.next(this.last);
      });
    },
    unmount() {
      this.subscription.unsubscribe();
      this.last = {};
    }
  };
}
