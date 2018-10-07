import React from 'react';
import { KomfuConsumer } from './context';
import { collection, Subjects } from 'komfu';

// Must be the same object, otherwise Subjects shallow equality
// won't work. Setting as constant
const DEFAULT_CONTEXT = {};

export default function attach(...middleware) {
  const Middleware = middleware[1] ? collection(...middleware) : middleware[0];

  return function(Component) {
    return class KomfuAttach extends React.Component {
      state = {
        props: null
      };
      subjects = new Subjects();
      sec = new Subjects();
      komfu = new Middleware().provide(this.subjects.$);
      // eslint-disable-next-line camelcase
      UNSAFE_componentWillReceiveProps(props) {
        if (this._isMounted) this.subjects.props(props);
      }
      componentDidMount() {
        this.komfu.mount();
        this.subjects.props(this.props);
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
        return this.state.props !== nextState.props || !this.subjects.ready;
      }
      render() {
        return (
          <KomfuConsumer>
            {(context) => {
              this.subjects.context(context || DEFAULT_CONTEXT);
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
