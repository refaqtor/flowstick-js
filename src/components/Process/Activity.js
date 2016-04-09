import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { DraggableCore } from 'react-draggable';

import PureComponent from '../PureComponent';
import styles from './styles/Activity';

export const ACTIVITY_HEIGHT = 60;
export const ACTIVITY_WIDTH = 90;

export class Activities extends PureComponent {
  static propTypes = {
    activities: ImmutablePropTypes.list.isRequired,
    dragActivity: PropTypes.func.isRequired,
    stopDragActivity: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div>
        {this.props.activities.map(act =>
          <Activity key={act.id} id={act.id}
            displayName={act.name} x={act.x} y={act.y}
            onDrag={this.props.dragActivity}
            onDragStop={this.props.stopDragActivity} />)}
      </div>
    );
  }
}

export class Activity extends PureComponent {
  static propTypes = {
    id: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    displayName: PropTypes.string,
    onDrag: PropTypes.func.isRequired,
    onDragStop: PropTypes.func.isRequired,
  }

  onDragStop() {
    const { id, onDragStop } = this.props;
    onDragStop(id);
  }

  onDrag(evt, ui) {
    const { id, onDrag } = this.props;
    const { deltaX, deltaY } = ui.position;
    onDrag(id, deltaX, deltaY);
  }

  render() {
    const { x, y } = this.props;
    let { displayName } = this.props;
    if ( !displayName ) {
      displayName = <em>Missing name...</em>;
    }
    return (
      <DraggableCore
        onDrag={this.onDrag.bind(this)}
        onStop={this.onDragStop.bind(this)}>
        <div
          className={styles.activity}
          style={{
            top: y, left: x,
            width: ACTIVITY_WIDTH, height: ACTIVITY_HEIGHT }}>
          {displayName}
        </div>
      </DraggableCore>
    );
  }
}
