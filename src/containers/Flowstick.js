import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AppHeader from '../components/AppHeader';
import FileDialog from '../components/FileDialog';
import Shade from '../components/Shade';
import ItemEditor from '../components/ItemEditor';
import { undo, redo } from '../actions/workflow';
import { openFileDialog, closeFileDialog } from '../actions/filedialog';
import { editItemChange } from '../actions/itemeditor';

let DevTools = null;

if (process.env.NODE_ENV !== 'production' &&
    process.env.WITH_DEVTOOLS) {
  DevTools = require('./DevTools');
  DevTools = <DevTools />;
}

export default class Flowstick extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    fileDialogIsOpen: PropTypes.bool.isRequired,
    closeFileDialog: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    undo: PropTypes.func.isRequired,
    redo: PropTypes.func.isRequired,
    editItem: ImmutablePropTypes.record,
    editItemChange: PropTypes.func.isRequired,
    undoAvailable: PropTypes.bool.isRequired,
    redoAvailable: PropTypes.bool.isRequired,
  }

  static styles = {
    height: '100vh',
  }

  render() {
    const { children, openFileDialog, closeFileDialog, fileDialogIsOpen,
            undo, redo, undoAvailable, redoAvailable, editItem,
            editItemChange } = this.props;
    const shadeContents = editItem ?
                          <ItemEditor
                            item={editItem}
                            onItemChange={editItemChange} /> :
                          null;
    return (
      <FileDialog open={fileDialogIsOpen} closeFileDialog={closeFileDialog}>
        <div className="columns vert-columns" style={Flowstick.styles}>
          <AppHeader
            redoAvailable={redoAvailable} redo={redo}
            undoAvailable={undoAvailable} undo={undo}
            fileDialogIsOpen={fileDialogIsOpen}
            openFileDialog={openFileDialog} />
          <section className="column columns vert-columns">
            {children}
          </section>
          <Shade visible={true}>{shadeContents}</Shade>
          {DevTools}
        </div>
      </FileDialog>
    );
  }
}

function mapStateToProps(state) {
  return {
    fileDialogIsOpen: Boolean(state.fileDialog.open),
    undoAvailable: Boolean(state.package.workflows.past.size),
    redoAvailable: Boolean(state.package.workflows.future.size),
    editItem: false,
  };
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    closeFileDialog,
    openFileDialog,
    undo,
    redo,
    editItemChange,
  }, dispatch);
}

const connectFlowstick = connect(
  mapStateToProps, mapDispatchToProps)(Flowstick);
export default connectFlowstick;
