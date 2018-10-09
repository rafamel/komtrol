import create from './create';
import collection from './collection';

export default function komfu(...middlewares) {
  const middleware = middlewares.length
    ? collection(...middlewares)
    : middlewares[0] || {};

  return create(middleware);
}
