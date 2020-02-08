import { Source } from '../sources';
import { useEffect, useState } from 'react';

export function useSource<T>(source: Source<T>): T {
  const [state, setState] = useState(source.data());
  useEffect(() => {
    const subscription = source.$.subscribe((value) => setState(value));
    return () => subscription.unsubscribe();
  }, []);

  return state;
}
