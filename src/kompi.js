import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import KompiBase from './KompiBase';

export default function kompi(...args) {
  let obj, Class;
  if (args[1]) (Class = args[0]) && (obj = args[1]);
  else (Class = Kompi) && (obj = args[0]);

  return class extends Class {
    init = obj.init ? obj.init.bind(this) : () => {};
    stream = obj.stream ? obj.stream.bind(this) : ($) => $;
    change = obj.change ? obj.change.bind(this) : () => {};
    mount = obj.mount ? obj.mount.bind(this) : () => {};
    unmount = obj.unmount ? obj.unmount.bind(this) : () => {};
  };
}

class Kompi extends KompiBase {
  constructor(stream$, collection) {
    super(stream$);

    this.collection = collection || null;
    this.next = () => {};
    this._init = false;
  }
  get out$() {
    return this.stream(this.in$).pipe(
      switchMap((res) => {
        const providers = res.providers;

        if (!this._init) {
          this._init = true;
          this.props = res.props;
          this.providers = providers;
          this.init();
        }

        return this.create(res).pipe(
          map((props) => {
            this.props = props;
            this.providers = providers;
            return { props, providers };
          })
        );
      })
    );
  }
  create(res) {
    return Observable.create((obs) => {
      this.next = (props) => obs.next(props);
      this.change
        ? this.change(res.props, res.providers)
        : this.next(res.props);
    });
  }
}
