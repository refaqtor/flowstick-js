import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import PureComponent from '../PureComponent';
import Workflow from '../Workflow';
import PackageNavigator from './Navigator';
import { dragActivity, stopDragActivity,
         focusObject } from '../../actions/workflow';
import { loadPackage } from '../../actions/package';
import { getLoading, getCurrentWorkflow, getWorkflows } from './selectors/Package';

class Package extends PureComponent {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    loadPackage: PropTypes.func.isRequired,
    filename: PropTypes.string.isRequired,
    workflows: ImmutablePropTypes.list.isRequired,
    currentWorkflowId: PropTypes.string,
    currentWorkflow: ImmutablePropTypes.record,
  }

  componentWillMount() {
    const { loadPackage, filename } = this.props;
    loadPackage(filename);
  }

  stopDragActivity(activityId, activityY) {
    const { stopDragActivity, currentWorkflow } = this.props;
    const { lanes, id } = currentWorkflow;
    stopDragActivity(id, activityId, activityY, lanes);
  }

  render() {
    const { workflows, loading, currentWorkflow, dragActivity,
            focusObject } = this.props;
    if ( loading ) {
      return <h1>Loading...</h1>;
    }

    let currentWorkflowDom;
    if (currentWorkflow) {
      const { focusedObject, lanes, lanesWidth, activities,
              transitions } = currentWorkflow;
      currentWorkflowDom =
        <Workflow
          className="column is-quadruple"
          lanes={lanes}
          lanesWidth={lanesWidth}
          activities={activities}
          transitions={transitions}
          dragActivity={dragActivity.bind(undefined, currentWorkflow.id)}
          focusObject={focusObject.bind(undefined, currentWorkflow.id)}
          focusedObject={focusedObject}
          stopDragActivity={this.stopDragActivity.bind(this)} />;
    }
    return (
      <div className="columns" style={{ height: '100%' }}>
        <PackageNavigator
          className="column"
          workflows={workflows} />
        {currentWorkflowDom}
      </div>
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

const connectedPackage = connect(mapStateToProps, mapDispatchToProps)(Package);
export default connectedPackage;
