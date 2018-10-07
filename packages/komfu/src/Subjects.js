import { BehaviorSubject, combineLatest } from 'rxjs';
import { take, filter, distinctUntilChanged } from 'rxjs/operators';

const INIT_VAL = {};
export default class Subjects {
  constructor() {
    this.subjects = {
      props: new BehaviorSubject(INIT_VAL),
      context: new BehaviorSubject(INIT_VAL)
    };

    this.$ = combineLatest(
      this.subjects.props.pipe(filter((x) => x !== INIT_VAL)).asObservable(),
      this.subjects.context
        .pipe(
          distinctUntilChanged(),
          filter((x) => x !== INIT_VAL)
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
