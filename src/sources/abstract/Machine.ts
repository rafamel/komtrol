import { Subject, Observable } from 'rxjs';
import { Promist } from 'promist';
import { Store } from './Store';
import { EmptyUnion, StateMap, Source } from '../types';

const busy = Symbol('busy');
const error = Symbol('error');
const promise = Symbol('promise');

export abstract class Machine<S, T = S, D = EmptyUnion> extends Store<S, T, D>
  implements Source<T> {
  private [busy]: boolean | null;
  private [error]: Subject<Error>;
  private [promise]: Promise<void>;
  protected constructor(
    state: S,
    deps: D,
    map: StateMap<S, T>,
    lock?: boolean
  ) {
    super(state, deps, map);
    this[busy] = lock ? false : null;
    this[error] = new Subject();
    this[promise] = Promise.resolve();
  }
  public get busy(): boolean {
    const value = this[busy];
    return value === null ? false : value;
  }
  public get error$(): Observable<Error> {
    return this[error].asObservable();
  }
  protected raise(err: Error): void {
    this[error].next(err);
  }
  protected async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    if (this[busy] === true) throw Error(`Machine is busy`);
    if (this[busy] === false) this[busy] = true;

    const source = this[promise];
    const promist = new Promist<void>();
    this[promise] = source.then(() => promist);

    return source
      .then(async () => {
        return fn();
      })
      .catch(async (err) => {
        this.raise(err);
        throw err;
      })
      .finally(() => {
        if (this[busy] === true) this[busy] = false;
        promist.resolve();
      });
  }
}
