import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { List } from 'immutable';
import AppBar from 'react-toolbox/lib/app_bar';

import ToolBar from '../ToolBar';
import styles from './styles/AppHeader';

export default class AppHeader extends Component {
  static propTypes = {
    openFile: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.appButtons = List([
      { icon: 'folder open', onClick: props.openFile },
    ]);
  }

  render() {
    return (
      <AppBar className={styles.appBar}>
        <ToolBar buttons={this.appButtons} />
      </AppBar>
    );
  }
}
