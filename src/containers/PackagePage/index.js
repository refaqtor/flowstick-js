import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Package from '../../components/Package';
import PureComponent from '../../components/PureComponent';
import { dragActivity, stopDragActivity,
         focusObject } from '../../actions/workflow';
import { loadPackage } from '../../actions/package';
import { getLoading, getCurrentWorkflow, getWorkflows } from './selectors';

const getFilename = props => props.params.packageFilename;

class PackagePage extends PureComponent {
  static propTypes = {
    params: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    workflows: ImmutablePropTypes.list.isRequired,
    currentWorkflow: ImmutablePropTypes.record,
  }

  loadPackage(filename) {
    const { loadPackage } = this.props;
    loadPackage(filename);
  }

  componentDidMount() {
    this.loadPackage(getFilename(this.props));
  }

  componentDidUpdate(prevProps) {
    const prevFn = getFilename(prevProps);
    const curFn = getFilename(this.props);
    if (prevFn !== curFn) {
      this.loadPackage(curFn);
    }
  }

  render() {
    const { loading, workflows, currentWorkflow,
            focusObject, stopDragActivity, dragActivity } = this.props;
    const filename = getFilename(this.props);
    if (!filename) {
      return <h1>Nothing to see...</h1>;
    }
    return (
      <Package
        filename={filename}
        loading={loading}
        workflows={workflows}
        focusObject={focusObject}
        stopDragActivity={stopDragActivity}
        dragActivity={dragActivity}
        currentWorkflow={currentWorkflow} />
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    loading: getLoading(state),
    workflows: getWorkflows(state),
    currentWorkflow: getCurrentWorkflow(state, ownProps),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    loadPackage,
    dragActivity,
    stopDragActivity,
    focusObject,
  }, dispatch);
}

const connectedPackagePage = connect(
  mapStateToProps, mapDispatchToProps)(PackagePage);
export default connectedPackagePage;
