import { combineLatest, ReplaySubject } from 'rxjs';
import { take, distinctUntilChanged } from 'rxjs/operators';

export default class Subjects {
  constructor() {
    this.subjects = {
      props: new ReplaySubject(1),
      context: new ReplaySubject(1)
    };

    this.$ = combineLatest(
      this.subjects.props.asObservable(),
      this.subjects.context.pipe(distinctUntilChanged()).asObservable()
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
