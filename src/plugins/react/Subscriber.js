import React from 'react';
import PropTypes from 'prop-types';
import createSubject from '../../create-subject';

export default class KompiSubscriber extends React.Component {
  static propTypes = {
    Kompi: PropTypes.any.isRequired,
    data: PropTypes.shape({
      providers: PropTypes.object.isRequired,
      props: PropTypes.object.isRequired
    })
  };
  state = {
    props: {}
  };
  subject = createSubject();
  kompi = new Kompi();
  stream$ = this.kompi.init(
    this.data.props,
    this.data.providers,
    this.subject.$
  );
  subscription = null;
  UNSAFE_componentWillReceiveProps({ data }) {
    this.subject.next({ providers: data.providers, props: data.props });
  }
  componentDidMount() {
    this._isMounted = true;
    this.kompi.subscription();
    this.subscription = this.stream$.subscribe(
      (props) => this._isMounted && this.setState({ props })
    );
    this.subject.next({ providers: data.providers, props: data.props });
  }
  componentWillUnmount() {
    this._isMounted = false;
    this.kompi.teardown();
    if (this.subscription) this.subscription.unsubscribe();
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.state.props !== nextState.props;
  }
  render() {}
}
