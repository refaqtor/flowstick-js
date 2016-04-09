import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as ProcessActions from '../../actions/process';
import PureComponent from '../PureComponent';
import { getActivities, getLanes, getLanesWidth,
         getTransitions } from './selectors/Process.js';
import { Transitions } from './Transition';
import { Lanes } from './Lane';
import { Activities } from './Activity';
import styles from './styles/Process';

class Process extends PureComponent {
  static propTypes = {
    loadProcess: PropTypes.func.isRequired,
    dragActivity: PropTypes.func.isRequired,
    stopDragActivity: PropTypes.func.isRequired,
    xpdlName: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    activities: ImmutablePropTypes.list.isRequired,
    lanes: ImmutablePropTypes.list.isRequired,
  }

  componentWillMount() {
    const { loadProcess, xpdlName } = this.props;
    loadProcess(xpdlName);
  }

  render() {
    const { lanes, lanesWidth, loading, activities, transitions,
            dragActivity, stopDragActivity } = this.props;
    if ( loading ) {
      return <h1>Loading...</h1>;
    }
    return (
      <section className={styles.process}>
        <Lanes lanes={lanes} width={lanesWidth} />
        <Activities activities={activities}
          dragActivity={dragActivity}
          stopDragActivity={stopDragActivity} />
        <Transitions transitions={transitions} />
      </section>
    );
  }
}

function mapStateToProps(state) {
  const { loaded } = state.process;
  return {
    loading: !loaded,
    lanes: getLanes(state),
    lanesWidth: getLanesWidth(state),
    transitions: getTransitions(state),
    activities: getActivities(state),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ProcessActions, dispatch);
}

const connectedProcess = connect(mapStateToProps, mapDispatchToProps)(Process);
export default connectedProcess;
