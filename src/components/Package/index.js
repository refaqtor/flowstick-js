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
    focusObject: PropTypes.func.isRequired,
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
    const { currentWorkflow, dragActivity, focusObject } = this.props;
    if (!currentWorkflow) {
      return null;
    }
    const { lanes, lanesWidth, activities, transitions,
            focusedObject } = currentWorkflow;
    return (
      <Workflow className={CurrentWorkflow.classNames}
        lanes={lanes}
        lanesWidth={lanesWidth}
        activities={activities}
        transitions={transitions}
        dragActivity={dragActivity.bind(undefined, currentWorkflow.id)}
        focusObject={focusObject.bind(undefined, currentWorkflow.id)}
        focusedObject={focusedObject}
        stopDragActivity={this.stopDragActivity.bind(this)} />
    );
  }
}

export default class Package extends Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    currentWorkflowId: PropTypes.string,
    focusObject: PropTypes.func.isRequired,
    dragActivity: PropTypes.func.isRequired,
    stopDragActivity: PropTypes.func.isRequired,
    workflows: ImmutablePropTypes.list.isRequired,
    filename: PropTypes.string.isRequired,
    currentWorkflow: ImmutablePropTypes.record,
  }

  static naviagtorStyles = { maxWidth: '25%' }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { workflows, stopDragActivity, dragActivity, focusObject, loading,
            currentWorkflow, filename } = this.props;
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
          filename={filename}
          className="column"
          style={Package.naviagtorStyles}
          workflows={workflows}
          currentWorkflow={currentWorkflow} />
        <CurrentWorkflow
          stopDragActivity={stopDragActivity}
          dragActivity={dragActivity}
          focusObject={focusObject}
          currentWorkflow={currentWorkflow} />
      </div>
    );
  }
}
