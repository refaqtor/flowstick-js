import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { List } from 'immutable';
import AppBar from 'react-toolbox/lib/app_bar';

import ToolBar from '../ToolBar';
import styles from './styles/AppHeader';

export default class AppHeader extends Component {
  static propTypes = {
    openFileDialog: PropTypes.func.isRequired,
    fileDialogIsOpen: PropTypes.bool.isRequired,
    undo: PropTypes.func.isRequired,
    redo: PropTypes.func.isRequired,
    undoAvailable: PropTypes.bool.isRequired,
    redoAvailable: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { openFileDialog, fileDialogIsOpen, undo, redo,
            undoAvailable, redoAvailable } = this.props;
    const appButtons = List([
      { icon: 'folder open', onClick: openFileDialog, disabled: fileDialogIsOpen },
      { icon: 'undo', onClick: undo, disabled: !undoAvailable },
      { icon: 'redo', onClick: redo, disabled: !redoAvailable },
    ]);
    return (
      <AppBar className={styles.appBar}>
        <ToolBar buttons={appButtons} />
      </AppBar>
    );
  }
}
