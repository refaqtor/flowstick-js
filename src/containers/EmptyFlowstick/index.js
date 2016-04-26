import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import classnames from 'classnames';
import Button from 'react-toolbox/lib/button';

import styles from './styles/EmptyFlowstick';
import { openFileDialog } from '../../actions/filedialog';

class EmptyFlowstick extends Component {
  static propTypes = {
    fileDialogIsOpen: PropTypes.bool.isRequired,
    openFileDialog: PropTypes.func.isRequired,
  }

  static classNames = classnames(
    'column', 'columns', 'vert-align', 'vert-columns', styles.main)

  render() {
    const { fileDialogIsOpen, openFileDialog } = this.props;
    return (
      <div className={EmptyFlowstick.classNames}>
        <Helmet title="Flowstick" />
        <h1 className="column" style={{ marginBottom: 14 }}>
          <i className="material-icons">sentiment_very_satisfied</i><br />
          Welcome to Flowstick!<br />
          What a beautiful day it is to edit some XPDL.
        </h1>
        <Button label="Open a File" className="column" raised accent
          disabled={fileDialogIsOpen}
          onClick={openFileDialog} />
      </div>
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
    openFileDialog,
  }, dispatch);
}

const connectedEmptyFlowstick = connect(
  mapStateToProps, mapDispatchToProps)(EmptyFlowstick);
export default connectedEmptyFlowstick;
