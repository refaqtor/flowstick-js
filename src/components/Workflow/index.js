import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classnames from 'classnames';

import PureComponent from '../PureComponent';
import { Transitions } from './Transition';
import { Lanes } from './Lane';
import { Activities } from './Activity';
import styles from './styles/Workflow';

export default class Workflow extends PureComponent {
  static propTypes = {
    dragActivity: PropTypes.func.isRequired,
    stopDragActivity: PropTypes.func.isRequired,
    lanesWidth: PropTypes.number.isRequired,
    transitions: ImmutablePropTypes.map.isRequired,
    activities: ImmutablePropTypes.list.isRequired,
    lanes: ImmutablePropTypes.list.isRequired,
    focusedObject: ImmutablePropTypes.record,
    focusObject: PropTypes.func.isRequired,
  }

  render() {
    const { lanes, lanesWidth, activities, transitions,
            dragActivity, stopDragActivity, focusedObject,
            focusObject, className } = this.props;
    return (
      <section className={classnames(className, styles.process)}>
        <Lanes lanes={lanes} width={lanesWidth} />
        <Activities activities={activities}
          focusActivity={focusObject.bind(undefined, 'activity')}
          dragActivity={dragActivity}
          stopDragActivity={stopDragActivity}
          focusedObject={focusedObject} />
        <Transitions transitions={transitions} />
      </section>
    );
  }
}
