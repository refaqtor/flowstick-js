import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { DraggableCore } from 'react-draggable';
import classnames from 'classnames';

import PureComponent from '../PureComponent';
import styles from './styles/Activity';

export const ACTIVITY_HEIGHT = 60;
export const HALF_ACTIVITY_HEIGHT = ACTIVITY_HEIGHT / 2;
export const ACTIVITY_WIDTH = 90;
export const HALF_ACTIVITY_WIDTH = ACTIVITY_WIDTH / 2;

export class Activities extends PureComponent {
  static propTypes = {
    activities: ImmutablePropTypes.list.isRequired,
    dragActivity: PropTypes.func.isRequired,
    focusActivity: PropTypes.func.isRequired,
    stopDragActivity: PropTypes.func.isRequired,
    focusedObject: ImmutablePropTypes.record,
  };

  render() {
    const { activities, dragActivity, stopDragActivity,
            focusedObject, focusActivity } = this.props;
    return (
      <div>
        {activities.map(act =>
          <Activity key={act.id} id={act.id}
            focused={focusedObject === act}
            displayName={act.name} x={act.x} y={act.y}
            onDrag={dragActivity}
            onDragStart={focusActivity.bind(undefined, act)}
            onDragStop={stopDragActivity} />)}
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
    onDragStart: PropTypes.func.isRequired,
    onDragStop: PropTypes.func.isRequired,
    focused: PropTypes.bool.isRequired,
  }

  onDragStop() {
    const { id, onDragStop, y } = this.props;
    onDragStop(id, y);
  }

  onDragStart() {
    this.props.onDragStart();
  }

  onDrag(evt, ui) {
    const { id, onDrag } = this.props;
    const { deltaX, deltaY } = ui.position;
    onDrag(id, deltaX, deltaY);
  }

  render() {
    const { x, y, focused } = this.props;
    let { displayName } = this.props;
    if ( !displayName ) {
      displayName = <em>Missing name...</em>;
    }
    return (
      <DraggableCore
        onStart={this.onDragStart.bind(this)}
        onDrag={this.onDrag.bind(this)}
        onStop={this.onDragStop.bind(this)}>
        <div
          className={classnames(styles.activity, { [styles.focused]: focused })}
          style={{
            top: y, left: x,
            width: ACTIVITY_WIDTH, height: ACTIVITY_HEIGHT }}>
          {displayName}
        </div>
      </DraggableCore>
    );
  }
}
