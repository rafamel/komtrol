import { useState, useEffect, useMemo } from 'react';
import { TFu } from '~/types';
import create from '~/create';
import pipe from '~/pipe';
import { shallowEqualProps as equal } from 'shallow-equal-props';
import { useContext } from './context';
import { BehaviorSubject } from 'rxjs';
import fu from '~/fu';
import { combineMerge } from '../utils';

export default useKomfu;

function useKomfu<B extends {}>(initialize: TFu<{}, B>): B;
function useKomfu<A extends {}, B extends A, P>(
  initialize: TFu<A, B>,
  props: P
): B;

function useKomfu(initialize: TFu<any, any>, props?: any): any {
  const context = useContext();
  const subject = useMemo(
    () => new BehaviorSubject(props ? { context } : { context, props }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const instance = useMemo(() => {
    return create(
      pipe(
        fu((instance) =>
          combineMerge(
            [instance.initial, subject.value],
            [instance.subscriber, subject]
          )
        ),
        initialize
      )
    );
  }, [initialize, subject]);
  const [state, setState] = useState(instance.initial);

  useEffect(() => {
    let mounted = true;
    const subscription = instance.subscriber.subscribe((value) => {
      if (mounted) setState(value);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [instance]);

  useEffect(() => {
    if (props && !equal(state.props, props)) {
      subject.next({ context, props });
    } else if (context !== state.context) {
      subject.next(props ? { context, props } : { context });
    }
  }, [context, props, subject]); // eslint-disable-next-line react-hooks/exhaustive-deps

  return state;
}
