import BaseKomfu from './BaseKomfu';

export default class PureKomfu extends BaseKomfu {
  provide(in$) {
    this.in$ = in$;
    const stream$ = this.stream(in$);
    this.out$ = stream$;

    return this;
  }
}
