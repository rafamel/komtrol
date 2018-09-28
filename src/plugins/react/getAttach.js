import React from 'react';
import createSubject from '../../create-subject';
import Subscriber from './Subscriber';
import { KompiConsumer } from './context';

export function attach(kompi) {
  return function(Component) {
    return class KompiAttach extends React.Component {
      subject = createSubject();
      kompi = kompi(subject$);
      componentDidMount() {
        kompi.init();
      }
      componentDidMount() {
        kompi.teardown();
      }
      render() {
        <KompiConsumer>
          {(context) => {
            subject.next({ context, props: this.props });
            return <Subscriber $={this.subject.$} />;
          }}
        </KompiConsumer>;
      }
    };
  };
}
