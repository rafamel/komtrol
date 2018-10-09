import { ReplaySubject, Observable, merge } from 'rxjs';
import {
  switchMap,
  map,
  take,
  distinctUntilChanged,
  skipUntil
} from 'rxjs/operators';
import uuid from 'uuid/v4';

export default {
  pure(in$) {
    this.in$ = in$;
    const stream$ = this.stream(in$);
    this.out$ = stream$;
  },
  komfu(in$) {
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
      this.init(props, providers);
      obs.next(res);
      obs.complete();
    });

    const stream$ = this.stream(
      merge(init$, in$.pipe(skipUntil(init$))).pipe(distinctUntilChanged())
    );

    this.out$ = stream$.pipe(
      switchMap(([props, providers]) => {
        setNext(props, providers);
        this.change(props, providers);
        return subject.pipe(
          map(([id, res]) => {
            const [props] = res;
            this.props = props;
            this.providers = providers;

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
  }
};
