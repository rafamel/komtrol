import { useState, useEffect, useMemo } from 'react';
import { TIntermediate, TUnion } from '~/types';
import create from '~/create';
import pipe from '~/pipe';
import { shallowEqual as equal } from 'shallow-equal-object';
import { useContext } from './context';
import { BehaviorSubject } from 'rxjs';
import { stateful } from '~/abstracts';

// TODO: make props/context subscription optional;
// we'll need a boolean "context" argument to determine
// whether props or context need to be updated, otherwise initialize
// (create) w/ empty object
export default useKomfu;

function useKomfu<A extends object, B extends object | void>(
  pipeline: (intermediate: TIntermediate<{}, void>) => TIntermediate<A, B>,
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
  const context = useContext();
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
  const [state, setState] = useState(instance.initial);

  useEffect(() => {
    let mounted = true;
    const subscription = instance.subscriber.subscribe((value) => {
      if (mounted) setState(value);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
      instance.teardown();
    };
  }, [instance]);

  useEffect(() => {
    if (props && !equal(subject.value.props, props)) {
      subject.next({ context, props });
    } else if (context !== subject.value.context) {
      subject.next(props ? { context, props } : { context });
    }
  }, [context, props, subject]);

  return state;
}
