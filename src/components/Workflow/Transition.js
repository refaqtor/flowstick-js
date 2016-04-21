import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import PureComponent from '../PureComponent';
import styles from './styles/Transition';
import { HALF_ACTIVITY_HEIGHT, HALF_ACTIVITY_WIDTH } from './Activity';

const POINT = PropTypes.shape({
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
});

const SEGMENT_THICKNESS = 10;
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
      <div className={styles.transitionWrap} style={inlineStyles}>
        <div className={styles.transition} />
      </div>
    );
  }
}

export class Transition extends PureComponent {
  static propTypes = {
    transition: ImmutablePropTypes.record.isRequired,
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

  computePoints(seg) {
    let { from, to } = seg;
    if (seg.toActivity) {
      to = this.closestActivityPoint(to, from);
    }
    if (to && seg.fromActivity) {
      from = this.closestActivityPoint(from, to);
    }
    return { from, to };
  }

  render() {
    const { transition } = this.props;
    const { segments } = transition;
    return (
      <div>
        {segments.map((seg, index) =>
          <Segment
            key={index}
            {...this.computePoints(seg)} />)}
      </div>
    );
  }
}

export class Transitions extends PureComponent {
  static propTypes = {
    transitions: ImmutablePropTypes.map.isRequired,
  }

  render() {
    const { transitions } = this.props;
    return (
      <div>
        {transitions.map(transition =>
          <Transition
            key={transition.id}
            transition={transition} />).toList()}
      </div>
    );
  }
}
