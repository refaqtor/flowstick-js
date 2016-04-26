import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AppHeader from '../components/AppHeader';
import FileDialog from '../components/FileDialog';
import { openFileDialog, closeFileDialog } from '../actions/filedialog';

let DevTools = null;

if (process.env.NODE_ENV !== 'production') {
  DevTools = require('./DevTools');
  DevTools = <DevTools />;
}

export default class Flowstick extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    fileDialogIsOpen: PropTypes.bool.isRequired,
    closeFileDialog: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
  }

  static styles = {
    height: '100vh',
  }

  render() {
    const { openFileDialog, closeFileDialog, fileDialogIsOpen } = this.props;
    return (
      <FileDialog open={fileDialogIsOpen} closeFileDialog={closeFileDialog}>
        <div className="columns vert-columns" style={Flowstick.styles}>
          <AppHeader
            fileDialogIsOpen={fileDialogIsOpen}
            openFileDialog={openFileDialog} />
          <section className="column columns vert-columns">
            {this.props.children}
          </section>
          {DevTools}
        </div>
      </FileDialog>
    );
  }
}

function mapStateToProps(state) {
  return {
    fileDialogIsOpen: Boolean(state.fileDialog.open),
  };
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    closeFileDialog,
    openFileDialog,
  }, dispatch);
}

const connectFlowstick = connect(
  mapStateToProps, mapDispatchToProps)(Flowstick);
export default connectFlowstick;
