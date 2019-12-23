import { useEffect, useMemo, useRef, useContext } from 'react';
import { TIntermediate, TUnion } from '~/types';
import create from '~/create';
import pipe from '~/pipe';
import { shallowEqual as equal } from 'shallow-equal-object';
import { BehaviorSubject } from 'rxjs';
import { stateful } from '~/abstracts';
import useForceUpdate from 'use-force-update';
import _context from './context';

// TODO: make props/context subscription optional;
// we'll need a boolean "context" argument to determine
// whether props or context need to be updated, otherwise initialize
// (create) w/ empty object
export default useKomfu;

function useKomfu<
  T extends void | object,
  A extends object,
  B extends object | void
>(
  pipeline: (intermediate: TIntermediate<{}, T>) => TIntermediate<A, B>,
  props?: void
): TUnion<A, B>;
function useKomfu<
  P,
  T extends { props: P },
  A extends object,
  B extends object | void
>(
  pipeline: (intermediate: TIntermediate<{}, T>) => TIntermediate<A, B>,
  props: P
): TUnion<A, B>;

function useKomfu<
  P,
  T extends { props: P },
  A extends object,
  B extends object | void
>(
  pipeline: (intermediate: TIntermediate<{}, T>) => TIntermediate<A, B>,
  props: P
): TUnion<A, B> {
  const lock = useRef(true);
  lock.current = true;

  const forceUpdate = useForceUpdate();
  const context = useContext(_context);
  const subject = useMemo(
    () => new BehaviorSubject(props ? { context, props } : { context }),
    []
  );

  const instance = useMemo(() => {
    return create(
      pipe(
        stateful((collect, emit) => {
          const subscription = subject.subscribe(emit);
          return {
            execute: () => subject.value as any,
            teardown: () => subscription.unsubscribe()
          };
        }),
        pipeline
      )
    );
  }, [pipeline, subject]);

  const self = useRef(instance.initial);
  useEffect(() => {
    let mounted = true;
    const subscription = instance.subscriber.subscribe((value) => {
      self.current = value;
      if (!lock.current && mounted) forceUpdate();
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
      instance.teardown();
    };
  }, [instance]);

  if (props && !equal(subject.value.props, props)) {
    subject.next({ context, props });
  } else if (context !== subject.value.context) {
    subject.next(props ? { context, props } : { context });
  }

  lock.current = false;
  return self.current;
}
