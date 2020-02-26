import { EmptyUnion, Source } from '../sources';
import { LifecycleFn } from './types';
import { useRef, useMemo, useState, useEffect } from 'react';
import { Handler } from 'proxy-handler';
import { skip } from 'rxjs/operators';

export function useSourceTrunk<
  S = EmptyUnion,
  C extends object = object,
  T extends Source<S> = Source<S>
>(
  context: C,
  source: (context: C) => T & Source<S>,
  lifecycle?: LifecycleFn<T, C>
): T {
  const running = useRef(true);
  running.current = true;

  const cxt = useRef(context);
  cxt.current = context;
  const wrap = useMemo(() => Handler.proxy(() => cxt.current), []);

  const controller = useMemo(() => source(wrap), []);
  const events = useMemo(
    () => (lifecycle ? lifecycle(controller) : undefined),
    []
  );

  const update = useState(0)[1];
  useEffect(() => {
    if (events && events.mount) events.mount(context);

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
  const previous = useRef<C | null>(null);
  useEffect(() => {
    if (events && events.every) events.every(context, previous.current);
    if (initialized.current) {
      if (events && events.update && context !== previous.current) {
        events.update(context, previous.current as C);
      }
    } else {
      initialized.current = true;
    }

    previous.current = context;
  });

  running.current = false;
  return controller;
}
