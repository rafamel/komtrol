import { Source } from './Source';
import { SourceData } from './types';
import { Observable, Subject } from 'rxjs';

export class Store<S = void, D = void> extends Source<S> {
  protected state: Readonly<S>;
  protected dependencies: D;
  private subject: Subject<SourceData<this>>;
  public constructor(state: S, dependencies: D) {
    super(
      () => this.data(),
      () => this.subject.asObservable()
    );
    this.state = state;
    this.dependencies = dependencies;
    this.subject = new Subject();
  }
  public get $(): Observable<SourceData<this>> {
    return super.$ as Observable<SourceData<this>>;
  }
  public data = (): S => this.state;
  public next(state?: Partial<S>): void {
    if (state !== undefined) {
      this.state =
        typeof state === 'object' && state !== null
          ? { ...this.state, ...state }
          : state;
    }

    this.subject.next(this.data() as SourceData<this>);
  }
}
