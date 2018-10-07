import { Observable, Subject, merge } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import BaseKomfu from './BaseKomfu';

export default class Komfu extends BaseKomfu {
  constructor(...args) {
    super(...args);
    this.initialized = false;
    this.provided = false;
  }
  provide(in$) {
    this.in$ = in$;
    const stream$ = this.stream(in$);

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

    return this;
  }
}
