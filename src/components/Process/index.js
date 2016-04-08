import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as ProcessActions from '../../actions/process';
import PureComponent from '../PureComponent';
import { Transitions } from './Transition';
import { Lanes } from './Lane';
import { Activities } from './Activity';
import styles from './styles/Process';

class Process extends PureComponent {
  static propTypes = {
    loadProcess: PropTypes.func.isRequired,
    dragActivity: PropTypes.func.isRequired,
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
    const { lanes, loading, activities,
            transitions, dragActivity } = this.props;
    if ( loading ) {
      return <h1>Loading...</h1>;
    }
    return (
      <section className={styles.process}>
        <Lanes lanes={lanes} />
        <Activities activities={activities}
          dragActivity={dragActivity} />
        <Transitions transitions={transitions} activities={activities} />
      </section>
    );
  }
}

function mapStateToProps(state) {
  const { transitions, lanes, activities, loaded } = state.process;
  return {
    lanes,
    activities,
    transitions,
    loading: !loaded,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ProcessActions, dispatch);
}

const connectedProcess = connect(mapStateToProps, mapDispatchToProps)(Process);
export default connectedProcess;
