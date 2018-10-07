import { Observable, Subject, merge } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

const ERR = {
  NOT_PROVIDED: new Error(
    "Komfu instance hasn't been provided for yet: komfu.provide(props$, providers$)."
  ),
  NOT_INITIALIZED: new Error('Komfu instance has not been initialized yet.')
};
export default class Komfu {
  constructor(middleware, collection) {
    Object.entries(middleware).forEach(([key, value]) => {
      if (typeof value === 'function') this[key] = value.bind(this);
      else this[key] = value;
    });

    this.options = Object.assign(
      {
        pure: false
      },
      middleware.options || {}
    );

    this.collection = collection || null;
    this.initialized = false;
    this.provided = false;
  }
  provide(in$) {
    this.in$ = in$;
    const stream$ = this.stream(in$);

    if (this.options.pure) {
      // PURE
      this.out$ = stream$;
    } else {
      // NOT PURE
      let _next;
      const subject = new Subject();
      const obs = Observable.create((obs) => {
        _next = obs.next.bind(obs);
        this.change(this.props, this.providers);
        _next = subject.next.bind(subject);
      });
      const setNext = (inProps, providers) => {
        this.next = function next(props, { merge } = {}) {
          const promise = new Promise((resolve) => {
            return resolveQueue.push(resolve);
          });
          _next([merge ? { ...inProps, ...props } : props, providers]);
          return promise;
        };
      };

      const resolveQueue = [];
      this.out$ = stream$.pipe(
        switchMap(([props, providers]) => {
          const piping = tap((props) => {
            this.props = props;
            this.providers = providers;
            resolveQueue.shift()();
          });

          if (!this.initialized) {
            this.props = props;
            this.providers = providers;
            setNext(props, providers);
            this.init();
            this.initialized = true;
            return merge(obs, subject).pipe(piping);
          } else {
            setNext(props, providers);
          }

          this.change(props, providers);
          return subject.pipe(piping);
        })
      );
    }

    return this;
  }
  get in$() {
    throw ERR.NOT_PROVIDED;
  }
  set in$(value) {
    Object.defineProperty(this, 'in$', { value });
  }
  get out$() {
    throw ERR.NOT_PROVIDED;
  }
  set out$(value) {
    Object.defineProperty(this, 'out$', { value });
  }
  get props$() {
    throw ERR.NOT_INITIALIZED;
  }
  set props$(value) {
    Object.defineProperty(this, 'props$', { value });
  }
  get providers$() {
    throw ERR.NOT_INITIALIZED;
  }
  set providers$(value) {
    Object.defineProperty(this, 'providers$', { value });
  }
  stream(stream$) {
    return stream$;
  }
  init() {}
  change(props, providers) {
    this.next(props);
  }
  mount() {}
  unmount() {}
}
