import { Subject, combineLatest } from 'rxjs';
import { take, map, filter } from 'rxjs/operators';

export default class Subjects {
  constructor() {
    this.subjects = {
      props: new Subject(),
      context: new Subject()
    };

    const INIT_VAL = {};
    let lastContext = null;
    this.$ = combineLatest(
      this.subjects.props.asObservable(),
      this.subjects.context
        .pipe(
          map((x) => (!x ? INIT_VAL : x)),
          filter((x) => {
            if (x === lastContext) return false;

            lastContext = x;
            return true;
          })
        )
        .asObservable()
    );

    this.ready = false;
    this.$.pipe(take(1))
      .toPromise()
      .then(() => (this.ready = true));
  }
  props(props) {
    return this.subjects.props.next(props);
  }
  context(context) {
    return this.subjects.context.next(context);
  }
}
