import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';

import Workflow from '../Workflow';
import PackageNavigator from './Navigator';

class CurrentWorkflow extends Component {
  static propTypes = {
    currentWorkflow: ImmutablePropTypes.record,
    focusObject: PropTypes.func.isRequired,
    dragActivity: PropTypes.func.isRequired,
    stopDragActivity: PropTypes.func.isRequired,
  }

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
      <Workflow className="column is-quadruple"
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

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { workflows, stopDragActivity, dragActivity, focusObject, loading,
            currentWorkflow, filename } = this.props;
    if (loading) {
      return <h1>Loading...</h1>;
    }
    return (
      <div className="columns column stretch-columns">
        <PackageNavigator
          filename={filename}
          className="column"
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
