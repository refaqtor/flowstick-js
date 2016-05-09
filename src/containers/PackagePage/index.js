import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import Package from '../../components/Package';
import { dragActivity, stopDragActivity, dragTransitionMarker,
         stopDragTransitionMarker, focusObject,
         unfocusAllObjects } from '../../actions/workflow';
import { loadPackage, setCurrentWorkflow } from '../../actions/package';
import { getLoading, getCurrentWorkflow, getWorkflows } from './selectors';

const getFilename = props => props.params.packageFilename;

class PackagePage extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    loadPackage: PropTypes.func.isRequired,
    dragActivity: PropTypes.func.isRequired,
    dragTransitionMarker: PropTypes.func.isRequired,
    stopDragTransitionMarker: PropTypes.func.isRequired,
    focusObject: PropTypes.func.isRequired,
    unfocusAllObjects: PropTypes.func.isRequired,
    stopDragActivity: PropTypes.func.isRequired,
    setCurrentWorkflow: PropTypes.func.isRequired,
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
    const { loading, workflows, currentWorkflow, setCurrentWorkflow,
            focusObject, stopDragActivity, dragActivity, dragTransitionMarker,
            unfocusAllObjects, stopDragTransitionMarker } = this.props;
    const filename = getFilename(this.props);
    if (!filename) {
      return <h1>Nothing to see...</h1>;
    }
    return (
      <section className="columns vert-columns column">
        <Helmet title={filename + ' | Flowstick'} />
        <Package
          filename={filename}
          loading={loading}
          workflows={workflows}
          setCurrentWorkflow={setCurrentWorkflow}
          focusObject={focusObject}
          unfocusAllObjects={unfocusAllObjects}
          stopDragActivity={stopDragActivity}
          dragActivity={dragActivity}
          dragTransitionMarker={dragTransitionMarker}
          stopDragTransitionMarker={stopDragTransitionMarker}
          currentWorkflow={currentWorkflow} />
      </section>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: getLoading(state),
    workflows: getWorkflows(state),
    currentWorkflow: getCurrentWorkflow(state),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    setCurrentWorkflow,
    loadPackage,
    dragActivity,
    stopDragActivity,
    focusObject,
    unfocusAllObjects,
    dragTransitionMarker,
    stopDragTransitionMarker,
  }, dispatch);
}

const connectedPackagePage = connect(
  mapStateToProps, mapDispatchToProps)(PackagePage);
export default connectedPackagePage;
