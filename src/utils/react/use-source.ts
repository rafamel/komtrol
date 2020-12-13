import { Source } from '../../definitions';
import { NullaryFn } from 'type-core';
import { useObservable, ReactHooksDependency } from 'multitude/push';

/**
 * Subscribes to a `Source` changes.
 */
export function useSource<T extends Source<any>>(
  React: ReactHooksDependency,
  create: NullaryFn<T>
): T {
  const source = React.useMemo(create, []);
  useObservable(React, () => source.state$);
  return source;
}
