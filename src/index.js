import kompi from './kompi';
import collection from './collection';
import * as Rx from 'rxjs';
import { map, tap } from 'rxjs/operators';

global.stream$ = Rx.interval(2000).pipe(
  map((x) => ({ props: x, providers: x + 3 }))
);

global.a = kompi({
  init() {},
  stream($) {
    return $.pipe(
      tap((x) => console.log('HELLO')),
      map((x) => ({ ...x, props: 'hello' }))
    );
  },
  change(props, providers) {
    console.log('CHANGE');
    console.log('PROPS', this.props, props);
    console.log('PROV', this.providers, providers);
    this.next(props);
  },
  mount() {},
  unmount() {},
  view(Component) {
    return Component;
  }
});

global.b = kompi({
  change(props, providers) {
    console.log('CHANGE2');
    this.next(props);
  }
});

global.col = collection(global.a, global.b);
