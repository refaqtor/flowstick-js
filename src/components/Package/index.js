import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import classnames from 'classnames';

import Workflow from '../Workflow';
import PackageNavigator from './Navigator';
import wfStyles from './styles/CurrentWorkflow';

class CurrentWorkflow extends Component {
  static propTypes = {
    currentWorkflow: ImmutablePropTypes.record,
    unfocusAllObjects: PropTypes.func.isRequired,
    focusObject: PropTypes.func.isRequired,
    dragTransitionMarker: PropTypes.func.isRequired,
    stopDragTransitionMarker: PropTypes.func.isRequired,
    dragActivity: PropTypes.func.isRequired,
    stopDragActivity: PropTypes.func.isRequired,
  }

  static classNames = classnames('column', 'is-quadruple', wfStyles.main)

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  stopDragActivity(activityId, activityY) {
    const { stopDragActivity, currentWorkflow } = this.props;
    const { lanes, id } = currentWorkflow;
    stopDragActivity(id, activityId, activityY, lanes);
  }

  render() {
    const { currentWorkflow, dragActivity, focusObject, stopDragTransitionMarker,
            unfocusAllObjects, dragTransitionMarker } = this.props;
    if (!currentWorkflow) {
      return null;
    }
    const { lanes, lanesWidth, activities, transitions, id } = currentWorkflow;
    return (
      <Workflow className={CurrentWorkflow.classNames}
        lanes={lanes}
        lanesWidth={lanesWidth}
        activities={activities}
        transitions={transitions}
        unfocusAllObjects={unfocusAllObjects.bind(undefined, id)}
        dragActivity={dragActivity.bind(undefined, id)}
        dragTransitionMarker={dragTransitionMarker.bind(undefined, currentWorkflow)}
        stopDragTransitionMarker={
          stopDragTransitionMarker.bind(undefined, currentWorkflow)}
        focusObject={focusObject.bind(undefined, id)}
        stopDragActivity={this.stopDragActivity.bind(this)} />
    );
  }
}

export default class Package extends Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    currentWorkflowId: PropTypes.string,
    focusObject: PropTypes.func.isRequired,
    unfocusAllObjects: PropTypes.func.isRequired,
    dragTransitionMarker: PropTypes.func.isRequired,
    stopDragTransitionMarker: PropTypes.func.isRequired,
    dragActivity: PropTypes.func.isRequired,
    stopDragActivity: PropTypes.func.isRequired,
    setCurrentWorkflow: PropTypes.func.isRequired,
    workflows: ImmutablePropTypes.list.isRequired,
    currentWorkflow: ImmutablePropTypes.record,
  }

  static naviagtorStyles = { maxWidth: '25%' }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { workflows, stopDragActivity, dragActivity, focusObject, loading,
            currentWorkflow, setCurrentWorkflow, unfocusAllObjects,
            dragTransitionMarker, stopDragTransitionMarker } = this.props;
    if (loading) {
      return (
        <div className="columns column vert-align">
          <div className="column" style={{ textAlign: 'center' }}>
            <ProgressBar type="circular" mode="indeterminate" />
          </div>
        </div>
      );
    }
    return (
      <div className="columns column stretch-columns">
        <PackageNavigator
          className="column"
          style={Package.naviagtorStyles}
          onNavClick={setCurrentWorkflow}
          workflows={workflows}
          currentWorkflow={currentWorkflow} />
        <CurrentWorkflow
          unfocusAllObjects={unfocusAllObjects}
          stopDragActivity={stopDragActivity}
          dragActivity={dragActivity}
          dragTransitionMarker={dragTransitionMarker}
          stopDragTransitionMarker={stopDragTransitionMarker}
          focusObject={focusObject}
          currentWorkflow={currentWorkflow} />
      </div>
    );
  }
}
