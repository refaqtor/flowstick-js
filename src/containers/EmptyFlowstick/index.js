import React, { Component } from 'react';
import Helmet from 'react-helmet';
import classnames from 'classnames';

import styles from './styles/EmptyFlowstick';

export default class EmptyFlowstick extends Component {
  static classNames = classnames('column', 'columns', 'vert-align', styles.main)

  render() {
    return (
      <div className={EmptyFlowstick.classNames}>
        <Helmet title="Flowstick" />
        <h1 className="column">
          <i className="material-icons">sentiment_very_satisfied</i><br />
          Welcome to Flowstick!<br />
          What a beautiful day it is to edit some XPDL.
        </h1>
      </div>
    );
  }
}
