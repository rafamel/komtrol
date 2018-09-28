import React from 'react';
import { Subject } from 'rxjs';
import { KompiConsumer } from './context';
import Kompi from '../../Kompi';

export default function attach(...middleware) {
  if (middleware[1]) middleware = collection(...middlewares);
  else middleware = middleware[0];

  return function(Component) {
    class KompiSubscriber extends React.Component {
      state = {
        props: null
      };
      subject = new Subject();
      kompi = new Kompi(middleware, this.subject.asObservable());
      UNSAFE_componentWillReceiveProps({ data }) {
        this.subject.next(data);
      }
      componentDidMount() {
        this._isMounted = true;
        this.subscription = this.kompi.out$.subscribe(({ props }) => {
          if (this._isMounted) this.setState({ props });
        });
        this.kompi.mount();
        this.subject.next(this.props.data);
      }
      componentWillUnmount() {
        this._isMounted = false;
        this.subscription.unsubscribe();
        this.kompi.unmount();
      }
      shouldComponentUpdate(nextProps, nextState) {
        return this.state.props !== nextState.props;
      }
      render() {
        const props = this.state.props;
        return props ? <Component {...props} /> : null;
      }
    }

    return class KompiAttach extends React.Component {
      render() {
        return (
          <KompiConsumer>
            {(context) => {
              return (
                <KompiSubscriber
                  data={{ props: this.props, providers: context }}
                />
              );
            }}
          </KompiConsumer>
        );
      }
    };
  };
}
