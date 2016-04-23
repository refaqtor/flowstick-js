import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Package from '../../components/Package';
import { dragActivity, stopDragActivity,
         focusObject } from '../../actions/workflow';
import { loadPackage } from '../../actions/package';
import { getLoading, getCurrentWorkflow, getWorkflows } from './selectors';

const getFilename = props => props.params.packageFilename;

class PackagePage extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    loadPackage: PropTypes.func.isRequired,
    dragActivity: PropTypes.func.isRequired,
    focusObject: PropTypes.func.isRequired,
    stopDragActivity: PropTypes.func.isRequired,
    workflows: ImmutablePropTypes.list.isRequired,
    currentWorkflow: ImmutablePropTypes.record,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
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
