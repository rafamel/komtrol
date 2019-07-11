import { TFuInitialize, TFu, IFuInstance } from '~/types';

export default function fu<A extends object, B extends object>(
  initialize: TFuInitialize<A, B>
): TFu<A, B> {
  return (instance) => {
    const current = initialize(instance);

    if (!current.initial) {
      current.initial = instance.initial as any;
    }
    if (!current.subscriber) {
      current.subscriber = instance.subscriber as any;
    }

    if (!current.teardown) {
      current.teardown = instance.teardown.bind(instance);
    } else {
      const teardown = current.teardown.bind(current);
      current.teardown = () => {
        instance.teardown();
        teardown();
      };
    }

    return current as Required<IFuInstance<B>>;
  };
}
