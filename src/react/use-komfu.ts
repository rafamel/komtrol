import { useState, useEffect, useMemo } from 'react';
import { extend } from '~/abstracts';
import { TFu } from '~/types';
import create from '~/create';
import pipe from '~/pipe';
import { shallowEqualProps as equal } from 'shallow-equal-props';
import { useContext } from './context';
import { BehaviorSubject } from 'rxjs';

export default useKomfu;

function useKomfu<B extends object>(provider: TFu<any, B>): B;
function useKomfu<A extends object, B extends A, P>(
  provider: TFu<A, B>,
  props: P
): B;

function useKomfu(provider: TFu<any, any>, props?: any): any {
  const context = useContext();
  const subject = useMemo(
    () => new BehaviorSubject(props ? { context } : { context, props }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const instance = useMemo(() => {
    return create(
      pipe(
        extend(() => ({
          initial: subject.value,
          subscriber: subject
        })),
        provider
      )
    );
  }, [provider, subject]);
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
