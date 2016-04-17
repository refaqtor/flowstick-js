import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import PureComponent from '../PureComponent';
import styles from './styles/Lane';

export class Lane extends PureComponent {
  static propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }

  render() {
    const { height, width, y } = this.props;
    return <div className={styles.lane} style={{ top: y, height, width }} />;
  }
}

export class Lanes extends PureComponent {
  static propTypes = {
    lanes: ImmutablePropTypes.list.isRequired,
    width: PropTypes.number.isRequired,
  }

  render() {
    const { lanes, width } = this.props;
    return (
      <div>
        {lanes.map(lane =>
          <Lane key={lane.id} height={lane.height} y={lane.y} width={width} />)}
      </div>
    );
  }
}