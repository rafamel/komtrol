import React from 'react';
import { KomfuConsumer } from './context';
import { komfu, Emitter } from 'komfu';

// Must be the same object, otherwise Subjects shallow equality
// won't work. Setting as constant
const DEFAULT_CONTEXT = {};

export default function attach(...middleware) {
  const Middleware = komfu(...middleware);

  return function(Component) {
    return class KomfuAttach extends React.Component {
      state = {
        props: null
      };
      emitter = new Emitter();
      komfu = new Middleware(this.emitter.$);
      // eslint-disable-next-line camelcase
      UNSAFE_componentWillReceiveProps(props) {
        if (this._isMounted) this.emitter.props(props);
      }
      componentDidMount() {
        this.komfu.mount();
        this.emitter.props(this.props);
        this._isMounted = true;

        this.subscription = this.komfu.out$.subscribe(([props]) => {
          if (this._isMounted) this.setState({ props });
        });
      }
      componentWillUnmount() {
        this._isMounted = false;
        this.subscription.unsubscribe();
        this.komfu.unmount();
      }
      shouldComponentUpdate(nextProps, nextState) {
        return this.state.props !== nextState.props || !this.emitter.ready;
      }
      render() {
        return (
          <KomfuConsumer>
            {(context) => {
              this.emitter.context(context || DEFAULT_CONTEXT);
              return this.state.props ? (
                <Component {...this.state.props} />
              ) : null;
            }}
          </KomfuConsumer>
        );
      }
    };
  };
}
