import { useMemo, useEffect, useState, useRef } from 'react';
import { Controller, ControllerStore, PublicStore } from './Controller';

export interface Lifecycle<C = any> {
  /**
   * Executes once, on component mount.
   */
  mount?: (context: C) => void;
  /**
   * Executes on every render, including mounts and updates.
   */
  every?: (context: C, previous: C | null) => void;
  /**
   * Executes on every render if the context is shallowly unequal to the previous.
   */
  update?: (context: C, previous: C) => void;
  /**
   * Executes once, on component unmount.
   */
  unmount?: () => void;
}

export type LifecycleFn<T extends Controller<any, any, any>, C = any> = (
  controller: T
) => Lifecycle<C>;

export function useController<
  S = void,
  C = void,
  T extends Controller<S, C, any> = Controller<S, C, any>
>(
  context: C,
  initial: ((context: C) => S) | null,
  initialize: (store: PublicStore<S, C>) => T,
  lifecycle?: LifecycleFn<T, C>
): { state: S; controller: T } {
  const running = useRef(true);
  running.current = true;

  const store = useMemo(
    () => new ControllerStore(initial ? initial(context) : undefined, context),
    []
  ) as ControllerStore<S, C>;
  const controller = useMemo(() => initialize(store), []);
  const events = useMemo(
    () => (lifecycle ? lifecycle(controller) : undefined),
    []
  );

  const update = useState(0)[1];
  useEffect(() => {
    if (events && events.mount) events.mount(context);

    let i = 1;
    const fn = (): void => {
      if (!running.current) update(i++);
    };
    store.subscribe(fn);
    return () => {
      if (events && events.unmount) events.unmount();
      store.unsubscribe(fn);
    };
  }, []);

  const initialized = useRef(false);
  const previous = useRef<C | null>(null);
  useEffect(() => {
    store.context = context;
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
  return {
    state: store.state(),
    controller
  };
}
