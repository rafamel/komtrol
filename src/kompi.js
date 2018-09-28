import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

export default class Kompi {
  constructor(middleware, stream$, collection) {
    Object.assign(this, middleware);

    this.in$ = stream$;
    this.collection = collection || null;
    this.stream$ = (this.init && this.init(stream$)) || stream$;

    const create = (res) => {
      return Observable.create((obs) => {
        this.next = (props) => obs.next(props);
        this.change
          ? this.change(res.props, res.providers)
          : this.next(res.props);
      });
    };

    let subscription = false;
    this.out$ = this.stream$.pipe(
      switchMap((res) => {
        const providers = res.providers;

        if (!subscription) {
          subscription = true;
          this.props = res.props;
          this.providers = providers;
          this.subscription();
        }

        return create(res).pipe(
          map((props) => {
            this.props = props;
            this.providers = providers;
            return { props, providers };
          })
        );
      })
    );
  }
  subscription() {}
  mount() {}
  unmount() {}
}
