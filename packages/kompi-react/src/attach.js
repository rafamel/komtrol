import React from 'react';
import { KompiConsumer } from './context';
import { Kompi, collection, Subjects } from 'kompi';

export default function attach(...middleware) {
  if (middleware[1]) middleware = collection(...middleware);
  else middleware = middleware[0];

  return function(Component) {
    return class KompiAttach extends React.Component {
      state = {
        props: null
      };
      subjects = new Subjects();
      kompi = new Kompi(middleware).provide(this.subjects.$);
      // eslint-disable-next-line camelcase
      UNSAFE_componentWillReceiveProps(props) {
        this.subjects.props(props);
      }
      componentDidMount() {
        this._isMounted = true;
        this.subscription = this.kompi.out$.subscribe(([props]) => {
          if (this._isMounted) this.setState({ props });
        });
        this.kompi.mount();
        this.subjects.props(this.props);
      }
      componentWillUnmount() {
        this._isMounted = false;
        this.subscription.unsubscribe();
        this.kompi.unmount();
      }
      shouldComponentUpdate(nextProps, nextState) {
        return this.state.props !== nextState.props || !this.subjects.ready;
      }
      render() {
        return (
          <KompiConsumer>
            {(context) => {
              this.subjects.context(context);
              return this.state.props ? (
                <Component {...this.state.props} />
              ) : null;
            }}
          </KompiConsumer>
        );
      }
    };
  };
}
