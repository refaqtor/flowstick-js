import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';

import PureComponent from '../PureComponent';
import styles from './styles/Transition';
import { ACTIVITY_HEIGHT, ACTIVITY_WIDTH } from './Activity';

const POINT = PropTypes.shape({
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
});

const SEGMENT_THICKNESS = 10;
const HALF_ACTIVITY_HEIGHT = ACTIVITY_HEIGHT / 2;
const HALF_ACTIVITY_WIDTH = ACTIVITY_WIDTH / 2;
const ACTIVITY_DIAGONAL_SLOPE = HALF_ACTIVITY_HEIGHT / HALF_ACTIVITY_WIDTH;

export class Segment extends PureComponent {
  static propTypes = {
    from: POINT,
    to: POINT,
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

  render() {
    const { from, to } = this.props;
    if (!to || !from) { return null; }
    const inlineStyles = this.styles(from, to);
    return (
      <div className={styles.transitionwrap} style={inlineStyles}>
        <div className={styles.transition} />
      </div>
    );
  }
}

export class Transition extends PureComponent {
  static propTypes = {
    transition: ImmutablePropTypes.record.isRequired,
    activityPositions: ImmutablePropTypes.map.isRequired,
  }

  getPoint(desired, activityPositions) {
    if (typeof desired === 'object') {
      return desired;
    }
    const activityPoint = activityPositions.get(desired);
    const x = activityPoint.x + HALF_ACTIVITY_WIDTH;
    const y = activityPoint.y + HALF_ACTIVITY_HEIGHT;
    return { x, y, activity: true };
  }

  closestActivityPoint(activityPoint, fromPoint) {
    const fromY = fromPoint.y;
    const fromX = fromPoint.x;
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

  computePoints(transition, activityPositions) {
    const { from, to } = transition;
    const fromPoint = this.getPoint(from, activityPositions);
    let toPoint = this.getPoint(to, activityPositions);
    if (toPoint.activity) {
      toPoint = this.closestActivityPoint(toPoint, fromPoint);
    }
    return { from: fromPoint, to: toPoint };
  }

  render() {
    const { transition, activityPositions } = this.props;
    const points = this.computePoints(transition, activityPositions);
    return <Segment {...points} />;
  }
}

export class Transitions extends PureComponent {
  static propTypes = {
    transitions: ImmutablePropTypes.map.isRequired,
    activities: ImmutablePropTypes.list.isRequired,
  }

  render() {
    const { transitions, activities } = this.props;
    const activityPositions = activities
      .reduce((accum, act) => accum.set(act.id, { x: act.x, y: act.y }), Map());
    return (
      <div>
        {transitions.map(transition =>
          <Transition
            key={transition.id}
            activityPositions={activityPositions}
            transition={transition} />).toList()}
      </div>
    );
  }
}
