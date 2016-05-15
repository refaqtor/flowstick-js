import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classnames from 'classnames';
import { DraggableCore } from 'react-draggable';

import styles from './styles/Transition';
import { HALF_ACTIVITY_HEIGHT, HALF_ACTIVITY_WIDTH } from './Activity';

const SEGMENT_THICKNESS = 10;
const ACTIVITY_DIAGONAL_SLOPE = HALF_ACTIVITY_HEIGHT / HALF_ACTIVITY_WIDTH;

export class Segment extends Component {
  static propTypes = {
    fromX: PropTypes.number,
    fromY: PropTypes.number,
    toX: PropTypes.number,
    toY: PropTypes.number,
    id: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
    onDragMarker: PropTypes.func.isRequired,
    onStopDragMarker: PropTypes.func.isRequired,
    hasStartHandle: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.handleMarkerDragFrom = this.handleMarkerDrag.bind(this, 'from');
    this.handleMarkerDragTo = this.handleMarkerDrag.bind(this, 'to');
    this.handleMarkerStopDragFrom = this.handleMarkerStopDrag.bind(this, 'from');
    this.handleMarkerStopDragTo = this.handleMarkerStopDrag.bind(this, 'to');
  }

  styles(x1, y1, x2, y2) {
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
    const propY = this.props[`${toOrFrom}Y`];
    const propX = this.props[`${toOrFrom}X`];
    const { id } = this.props;
    this.props.onStopDragMarker(id, toOrFrom, propX, propY);
  }

  handleMarkerDrag(toOrFrom, evt, ui) {
    const { deltaX, deltaY } = ui.position;
    const propY = this.props[`${toOrFrom}Y`];
    const propX = this.props[`${toOrFrom}X`];
    const { id } = this.props;
    this.props.onDragMarker(id, toOrFrom, deltaX, deltaY, propX, propY);
  }

  render() {
    const { fromX, fromY, toX, toY, onClick, hasStartHandle } = this.props;
    // Only expect the from or to to be missing, never one of each
    if (typeof fromX !== 'number' || typeof toX !== 'number') {
      return null;
    }
    const inlineStyles = this.styles(fromX, fromY, toX, toY);
    const startHandle = hasStartHandle ?
      <DraggableCore
        onStop={this.handleMarkerStopDragFrom}
        onDrag={this.handleMarkerDragFrom}>
        <div className={styles.handle} />
      </DraggableCore> : null;
    return (
      <div className={styles.transitionWrap} style={inlineStyles}
        onClick={onClick}>
        <div>
          {startHandle}
          <div className={styles.transition} />
          <DraggableCore
            onStop={this.handleMarkerStopDragTo}
            onDrag={this.handleMarkerDragTo}>
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
    return {
      toX: to && to.x + seg.toOffsetX,
      toY: to && to.y + seg.toOffsetY,
      fromX: from && from.x + seg.fromOffsetX,
      fromY: from && from.y + seg.fromOffsetY,
    };
  }

  handleStopDragMarker = (...args) => {
    const { id } = this.props.transition;
    this.props.onStopDragMarker.apply(undefined, [id, ...args]);
  }

  handleDragMarker = (...args) => {
    const { id } = this.props.transition;
    this.props.onDragMarker.apply(undefined, [id, ...args]);
  }

  handleSegmentClick = evt => {
    const { onClick, transition } = this.props;
    onClick(transition.id);
    evt.stopPropagation();
  }

  render() {
    const { segments, focused } = this.props.transition;
    return (
      <div className={classnames({ [styles.focused]: focused })}>
        {segments.map((seg, index) =>
          <Segment key={index}
            id={index}
            onClick={this.handleSegmentClick}
            onDragMarker={this.handleDragMarker}
            onStopDragMarker={this.handleStopDragMarker}
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
