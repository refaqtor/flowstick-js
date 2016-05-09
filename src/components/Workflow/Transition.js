import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classnames from 'classnames';
import { DraggableCore } from 'react-draggable';

import styles from './styles/Transition';
import { HALF_ACTIVITY_HEIGHT, HALF_ACTIVITY_WIDTH } from './Activity';

const POINT = PropTypes.shape({
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
});

const SEGMENT_THICKNESS = 10;
const ACTIVITY_DIAGONAL_SLOPE = HALF_ACTIVITY_HEIGHT / HALF_ACTIVITY_WIDTH;

export class Segment extends Component {
  static propTypes = {
    from: POINT,
    to: POINT,
    onClick: PropTypes.func.isRequired,
    onDragMarker: PropTypes.func.isRequired,
    onStopDragMarker: PropTypes.func.isRequired,
    hasStartHandle: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  styles(from, to) {
    const x1 = from.x;
    const y1 = from.y;
    const x2 = to.x;
    const y2 = to.y;

    const len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    const cx = (x1 + x2) / 2 - len / 2;
    const cy = (y1 + y2) / 2 - SEGMENT_THICKNESS / 2;
    const angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);
    return {
      left: cx,
      top: cy,
      width: len,
      height: SEGMENT_THICKNESS,
      transform: `rotate(${angle}deg)`,
    };
  }

  handleMarkerStopDrag(toOrFrom) {
    const prop = this.props[toOrFrom];
    this.props.onStopDragMarker(toOrFrom, prop.x, prop.y);
  }

  handleMarkerDrag(toOrFrom, evt, ui) {
    const { deltaX, deltaY } = ui.position;
    const prop = this.props[toOrFrom];
    this.props.onDragMarker(toOrFrom, deltaX, deltaY, prop.x, prop.y);
  }

  render() {
    const { from, to, onClick, hasStartHandle } = this.props;
    if (!to || !from) { return null; }
    const inlineStyles = this.styles(from, to);
    const startHandle = hasStartHandle ?
      <DraggableCore
        onStop={this.handleMarkerStopDrag.bind(this, 'from')}
        onDrag={this.handleMarkerDrag.bind(this, 'from')}>
        <div className={styles.handle} />
      </DraggableCore> : null;
    return (
      <div className={styles.transitionWrap} style={inlineStyles}
        onClick={onClick}>
        <div>
          {startHandle}
          <div className={styles.transition} />
          <DraggableCore
            onStop={this.handleMarkerStopDrag.bind(this, 'to')}
            onDrag={this.handleMarkerDrag.bind(this, 'to')}>
            <div className={styles.handle} />
          </DraggableCore>
        </div>
      </div>
    );
  }
}

export class Transition extends Component {
  static propTypes = {
    transition: ImmutablePropTypes.record.isRequired,
    onClick: PropTypes.func.isRequired,
    onDragMarker: PropTypes.func.isRequired,
    onStopDragMarker: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  closestActivityPoint(activityPoint, fromX, fromY) {
    const topActivityY = activityPoint.y - HALF_ACTIVITY_HEIGHT;
    const bottomActivityY = activityPoint.y + HALF_ACTIVITY_HEIGHT;
    const leftActivityX = activityPoint.x - HALF_ACTIVITY_WIDTH;
    const rightActivityX = activityPoint.x + HALF_ACTIVITY_WIDTH;

    if (fromY >= topActivityY && fromY <= bottomActivityY &&
        fromX >= leftActivityX && fromX <= rightActivityX) {
      // This means the line will be all contained within the activities. Don't
      // bother drawing this.
      return null;
    }

    const sameX = fromX === activityPoint.x;
    // This means undefined slope (divsion by zero, but we know point already).
    if (sameX && fromY <= topActivityY) {
      return { x: fromX, y: topActivityY };
    } else if (sameX) {
      return { x: fromX, y: bottomActivityY };
    }

    let y, x;
    const slope = (activityPoint.y - fromY) / (activityPoint.x - fromX);
    const topBottomIntercept = Math.abs(slope) >= ACTIVITY_DIAGONAL_SLOPE;
    const intercept = fromY - slope * fromX;
    if (fromY <= topActivityY && topBottomIntercept) {
      // Intercept with top line
      y = topActivityY;
      x = (y - intercept) / slope;
    } else if (fromY >= bottomActivityY && topBottomIntercept) {
      // Intercept with bottom line
      y = bottomActivityY;
      x = (y - intercept) / slope;
    } else if (fromX <= leftActivityX) {
      // Intercept with left line
      x = leftActivityX;
      y = slope * x + intercept;
    } else if (fromX >= rightActivityX) {
      // Intercept wiht right line
      x = rightActivityX;
      y = slope * x + intercept;
    }
    return { x, y };
  }

  computePoints(seg) {
    let { from, to } = seg;
    if (seg.toActivity) {
      to = this.closestActivityPoint(
        to, from.x + seg.fromOffsetX, from.y + seg.fromOffsetY);
    }
    if (to && seg.fromActivity) {
      from = this.closestActivityPoint(
        from, to.x + seg.toOffsetX, to.y + seg.toOffsetY);
    }
    from = from && { x: from.x + seg.fromOffsetX, y: from.y + seg.fromOffsetY };
    to = to && { x: to.x + seg.toOffsetX, y: to.y + seg.toOffsetY };
    return { to, from };
  }

  segmentClick(evt) {
    const { onClick, transition } = this.props;
    onClick(transition);
    evt.stopPropagation();
  }

  render() {
    const { transition, onDragMarker, onStopDragMarker } = this.props;
    const { segments, focused, id } = transition;
    const onSegClick = this.segmentClick.bind(this);
    return (
      <div className={classnames({ [styles.focused]: focused })}>
        {segments.map((seg, index) =>
          <Segment
            key={index}
            onClick={onSegClick}
            onDragMarker={onDragMarker.bind(undefined, id, index)}
            onStopDragMarker={onStopDragMarker.bind(undefined, id, index)}
            hasStartHandle={index === 0}
            {...this.computePoints(seg)} />)}
      </div>
    );
  }
}

export class Transitions extends Component {
  static propTypes = {
    transitions: ImmutablePropTypes.map.isRequired,
    focusTransition: PropTypes.func.isRequired,
    dragTransitionMarker: PropTypes.func.isRequired,
    stopDragTransitionMarker: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { transitions, focusTransition, dragTransitionMarker,
            stopDragTransitionMarker } = this.props;
    return (
      <div>
        {transitions.map(transition =>
          <Transition
            key={transition.id}
            onClick={focusTransition}
            onDragMarker={dragTransitionMarker}
            onStopDragMarker={stopDragTransitionMarker}
            transition={transition} />).toList()}
      </div>
    );
  }
}
