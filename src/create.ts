import { TFu, IFuInstance } from './types';
import { of } from 'rxjs';

export default create;

function create<A extends {}, B extends A>(
  initialize: TFu<A, B>,
  initial: A
): Required<IFuInstance<B>>;
function create<B extends {}>(initialize: TFu<{}, B>): Required<IFuInstance<B>>;

function create(
  initialize: TFu<any, any>,
  initial?: any
): Required<IFuInstance<any>> {
  if (!initial) initial = {};

  return initialize({
    initial,
    subscriber: of(initial),
    teardown: () => {}
  });
}
