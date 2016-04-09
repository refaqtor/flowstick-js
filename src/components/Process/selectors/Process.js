import { Record, List, Map } from 'immutable';
import { createSelector } from 'reselect';

import { ACTIVITY_HEIGHT, ACTIVITY_WIDTH } from '../Activity';

const HALF_ACTIVITY_HEIGHT = ACTIVITY_HEIGHT / 2;
const HALF_ACTIVITY_WIDTH = ACTIVITY_WIDTH / 2;
export const LANE_BUFFER = 15;
export const DEFAULT_LANE_HEIGHT = 150;

const ViewLane = Record({
  id: undefined,
  name: undefined,
  height: DEFAULT_LANE_HEIGHT,
  y: 0,
});

const ViewActivity = Record({
  id: undefined,
  name: undefined,
  laneId: undefined,
  x: 0,
  y: 0,
});

const ViewSegment = Record({
  toActivity: false,
  fromActivity: false,
  from: undefined,
  to: undefined,
});

function getActivityBottom(activity) {
  return activity.relativeY + ACTIVITY_HEIGHT; // TODO other kinds of activities
}
function getActivityRight(activity) {
  return activity.x + ACTIVITY_WIDTH; // TODO other kinds of activities
}

function addActivityOffsets(act) {
  return {
    x: act.x + HALF_ACTIVITY_WIDTH,
    y: act.y + HALF_ACTIVITY_HEIGHT,
  };
}


const getProcess = state => state.process;
const getBaseActivities = createSelector(
  getProcess,
  process => process.activities
);

export const getLanesWidth = createSelector(
  getBaseActivities,
  activities => activities.map(getActivityRight).max() + LANE_BUFFER
);

export const getLanes = createSelector(
  getProcess,
  getBaseActivities,
  (process, activities) => {
    const partitions = activities.groupBy(act => act.laneId);
    const maxByLane = partitions.map(
      activities => activities.map(getActivityBottom).max() + LANE_BUFFER
    );
    return process.lanes.reduce((accum, lane) => {
      const prevLane = accum.last();
      const y = prevLane ? prevLane.y + prevLane.height : 0;
      const tenativeHeight = maxByLane.get(lane.id, DEFAULT_LANE_HEIGHT);
      const height = tenativeHeight < DEFAULT_LANE_HEIGHT ?
        DEFAULT_LANE_HEIGHT : tenativeHeight;
      return accum.push(ViewLane({
        y,
        height,
        id: lane.id,
        name: lane.name,
      }));
    }, List());
  }
);

export const getActivities = createSelector(
  getBaseActivities,
  getLanes,
  (activities, lanes) => {
    const laneOffsets = Map(lanes.map(lane => [lane.id, lane.y]));
    return activities.map(act =>
      ViewActivity({
        id: act.id,
        name: act.name,
        laneId: act.laneId,
        x: act.x + act.draggingDeltaX,
        y: act.relativeY + act.draggingDeltaY + laneOffsets.get(act.laneId, 0),
      })
    );
  }
);

export const getTransitions = createSelector(
  getProcess,
  getActivities,
  (process, activities) => {
    const activityPositions = Map(activities.map(act => [act.id, act]));
    return process.transitions.map(transition =>
      transition.merge({
        segments: transition.segments.map(seg => {
          let { to, from } = seg;
          let toActivity = false, fromActivity = false;
          if (typeof seg.to === 'string') {
            toActivity = true;
            to = addActivityOffsets(activityPositions.get(seg.to));
          }
          if (typeof seg.from === 'string') {
            fromActivity = true;
            from = addActivityOffsets(activityPositions.get(seg.from));
          }
          return ViewSegment({ toActivity, fromActivity, to, from });
        }),
      })
    );
  }
);
