import { Machine } from '../../definitions';
import { NullaryFn } from 'type-core';
import { ReactHooksDependency } from 'multitude/push';

/**
 * Calls `Machine.enable` before render and `Machine.disable` on unmount.
 */
export function useMachine<T extends Machine>(
  React: ReactHooksDependency,
  create: NullaryFn<T>
): T {
  const machine = React.useMemo(() => {
    const instance = create();
    instance.enable();
    return instance;
  }, []);

  React.useEffect(() => () => machine.disable(), []);

  return machine;
}
