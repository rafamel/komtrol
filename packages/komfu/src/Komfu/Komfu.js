import { ReplaySubject, Observable, merge } from 'rxjs';
import {
  switchMap,
  map,
  take,
  distinctUntilChanged,
  skipUntil
} from 'rxjs/operators';
import PureKomfu from './PureKomfu';
import uuid from 'uuid/v4';

const INITIALIZED = Symbol('initialized');
const MOUNT_PENDING = Symbol('pending');

export default class Komfu extends PureKomfu {
  constructor(...args) {
    super(...args);
    this[INITIALIZED] = false;
    this[MOUNT_PENDING] = false;
  }
  mount() {
    if (this[INITIALIZED]) return this.onMount();
    else this[MOUNT_PENDING] = true;
  }
  unmount() {
    if (!this[MOUNT_PENDING]) return this.onUnmount();
    else this[MOUNT_PENDING] = false;
  }
  provide(in$) {
    this.in$ = in$;

    const resolvers = {};
    const subject = new ReplaySubject(1);
    const setNext = (inProps, ...other) => {
      this.next = function next(props, { merge = true } = {}) {
        const id = uuid();
        const promise = new Promise((resolve) => (resolvers[id] = resolve));
        subject.next([
          id,
          [merge ? { ...inProps, ...props } : props, ...other]
        ]);
        return promise;
      };
    };

    const init$ = Observable.create(async (obs) => {
      const res = await in$.pipe(take(1)).toPromise();
      const [props, providers] = res;
      setNext(props);
      this.props = props;
      this.providers = providers;
      this.init(props, providers);
      this[INITIALIZED] = true;
      if (this[MOUNT_PENDING]) {
        this.onMount();
        this[MOUNT_PENDING] = false;
      }
      obs.next(res);
      obs.complete();
    });

    const stream$ = this.stream(
      merge(init$, in$.pipe(skipUntil(init$))).pipe(distinctUntilChanged())
    );

    this.out$ = stream$.pipe(
      switchMap(([props, providers]) => {
        setNext(props, providers);
        this.onChange(props, providers);
        this.providers = providers;
        return subject.pipe(
          map(([id, res]) => {
            const [props] = res;
            this.props = props;

            if (resolvers[id]) {
              resolvers[id]();
              delete resolvers[id];
            }

            return res;
          })
        );
      }),
      distinctUntilChanged()
    );

    return this;
  }
}
