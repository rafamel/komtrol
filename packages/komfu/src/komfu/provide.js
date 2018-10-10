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
      this.init(...res);
      obs.next(res);
      obs.complete();
    });

    const stream$ = this.stream(
      merge(init$, in$.pipe(skipUntil(init$))).pipe(distinctUntilChanged())
    );

    this.out$ = stream$.pipe(
      switchMap((res) => {
        setNext(...res);
        this.change(...res);
        return subject.pipe(
          map(([id, inner]) => {
            this.props = inner.props;
            this.context = res.context;

            if (resolvers[id]) {
              resolvers[id]();
              delete resolvers[id];
            }

            return inner;
          })
        );
      }),
      distinctUntilChanged()
    );
  }
};
