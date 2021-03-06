import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { DraggableCore } from 'react-draggable';
import classnames from 'classnames';

import styles from './styles/Activity';

export const ACTIVITY_HEIGHT = 60;
export const HALF_ACTIVITY_HEIGHT = ACTIVITY_HEIGHT / 2;
export const ACTIVITY_WIDTH = 90;
export const HALF_ACTIVITY_WIDTH = ACTIVITY_WIDTH / 2;

export class Activities extends Component {
  static propTypes = {
    activities: ImmutablePropTypes.list.isRequired,
    dragActivity: PropTypes.func.isRequired,
    focusActivity: PropTypes.func.isRequired,
    stopDragActivity: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  focusActivity = actId => {
    this.props.focusActivity(actId);
  }

  render() {
    const { activities, dragActivity, stopDragActivity } = this.props;
    return (
      <div>
        {activities.map(act =>
          <Activity key={act.id} id={act.id}
            focused={act.focused}
            ofInterest={act.ofInterest}
            displayName={act.name} x={act.x} y={act.y}
            onDrag={dragActivity}
            onDragStart={this.focusActivity}
            onDragStop={stopDragActivity} />)}
      </div>
    );
  }
}

export class Activity extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    displayName: PropTypes.string,
    onDrag: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onDragStop: PropTypes.func.isRequired,
    focused: PropTypes.bool.isRequired,
    ofInterest: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = newProps => {
      return this.props.x !== newProps.x ||
        this.props.y !== newProps.y ||
        this.props.displayName !== newProps.displayName ||
        this.props.focused !== newProps.focused ||
        this.props.ofInterest !== newProps.ofInterest ||
        this.props.ofInterest !== newProps.ofInterest ||
        this.props.onDragStop !== newProps.onDragStop ||
        this.props.onDrag !== newProps.onDrag ||
        false;
    };
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  onDragStop = () => {
    const { id, onDragStop, y } = this.props;
    onDragStop(id, y);
  }

  onDragStart = () => {
    const { id, onDragStart } = this.props;
    onDragStart(id);
  }

  onDrag = (evt, ui) => {
    const { id, onDrag } = this.props;
    const { deltaX, deltaY } = ui.position;
    onDrag(id, deltaX, deltaY);
  }

  handleClick(evt) {
    evt.stopPropagation();
  }

  render() {
    const { x, y, focused, ofInterest } = this.props;
    let { displayName } = this.props;
    if ( !displayName ) {
      displayName = <em>Missing name...</em>;
    }
    return (
      <DraggableCore
        onStart={this.onDragStart}
        onDrag={this.onDrag}
        onStop={this.onDragStop}>
        <div
          onClick={this.handleClick}
          className={classnames(styles.activity, {
            [styles.focused]: focused,
            [styles.ofInterest]: ofInterest,
          })}
          style={{
            top: y, left: x,
            width: ACTIVITY_WIDTH, height: ACTIVITY_HEIGHT }}>
          {displayName}
        </div>
      </DraggableCore>
    );
  }
}
