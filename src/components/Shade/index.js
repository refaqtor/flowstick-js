import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import styles from './styles/Shade';

export default class Shade extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    visible: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { visible, children } = this.props;
    const conditionalStyles = { [styles.shadeVisible]: visible };
    return (
      <section className={classnames(styles.shade, conditionalStyles)}>
        {children}
      </section>
    );
  }
}
