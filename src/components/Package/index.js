import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import PureComponent from '../PureComponent';
import Workflow from '../Workflow';
import { dragActivity, stopDragActivity } from '../../actions/workflow';
import { loadPackage } from '../../actions/package';
import { getCurrentWorkflow, getWorkflows } from './selectors/Package';

class Package extends PureComponent {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    loadPackage: PropTypes.func.isRequired,
    fileName: PropTypes.string.isRequired,
    workflows: ImmutablePropTypes.list.isRequired,
    currentWorkflow: ImmutablePropTypes.record.isRequired,
  }

  componentWillMount() {
    const { loadPackage, fileName } = this.props;
    loadPackage(fileName);
  }

  stopDragActivity(activityId, activityY) {
    const { stopDragActivity, currentWorkflow } = this.props;
    const { lanes } = currentWorkflow;
    stopDragActivity(activityId, activityY, lanes);
  }

  render() {
    const { loading, currentWorkflow, dragActivity } = this.props;
    if ( loading ) {
      return <h1>Loading...</h1>;
    }
    const { lanes, lanesWidth, activities, transitions } = currentWorkflow;
    return (
      <div>
        <Workflow
          lanes={lanes}
          lanesWidth={lanesWidth}
          activities={activities}
          transitions={transitions}
          dragActivity={dragActivity}
          stopDragActivity={this.stopDragActivity.bind(this)} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { loaded } = state.package;
  return {
    loading: !loaded,
    workflows: getWorkflows(state),
    currentWorkflow: getCurrentWorkflow(state),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    loadPackage,
    dragActivity,
    stopDragActivity,
  }, dispatch);
}

const connectedPackage = connect(mapStateToProps, mapDispatchToProps)(Package);
export default connectedPackage;
