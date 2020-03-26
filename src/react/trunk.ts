import { useRef, useMemo, useState, useEffect } from 'react';
import { skip } from 'rxjs/operators';
import { Handler } from 'proxy-handler';
import { EmptyUnion, Source } from '../sources';
import { LifecycleFn } from './types';

export function useSourceTrunk<
  S = EmptyUnion,
  D extends object = object,
  T extends Source<S> = Source<S>
>(
  deps: D,
  source: (deps: D) => T & Source<S>,
  lifecycle?: LifecycleFn<T, D>
): T {
  const running = useRef(true);
  running.current = true;

  const cxt = useRef(deps);
  cxt.current = deps;
  const wrap = useMemo(() => Handler.proxy(() => cxt.current), []);

  const controller = useMemo(() => source(wrap), []);
  const events = useMemo(
    () => (lifecycle ? lifecycle(controller) : undefined),
    []
  );

  const update = useState(0)[1];
  useEffect(() => {
    if (events && events.mount) events.mount(deps);

    let i = 1;
    const subscription = controller.state$.pipe(skip(1)).subscribe((): void => {
      if (!running.current) update(i++);
    });
    return () => {
      if (events && events.unmount) events.unmount();
      subscription.unsubscribe();
    };
  }, []);

  const initialized = useRef(false);
  const previous = useRef<D | null>(null);
  useEffect(() => {
    if (events && events.every) events.every(deps, previous.current);
    if (initialized.current) {
      if (events && events.update && deps !== previous.current) {
        events.update(deps, previous.current as D);
      }
    } else {
      initialized.current = true;
    }

    previous.current = deps;
  });

  running.current = false;
  return controller;
}
