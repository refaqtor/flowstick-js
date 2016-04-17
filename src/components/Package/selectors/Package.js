import { Record, List, Map } from 'immutable';
import { createSelector } from 'reselect';

import { ACTIVITY_HEIGHT, ACTIVITY_WIDTH } from '../../Workflow/Activity';

const HALF_ACTIVITY_HEIGHT = ACTIVITY_HEIGHT / 2;
const HALF_ACTIVITY_WIDTH = ACTIVITY_WIDTH / 2;

const LANE_BUFFER = 15;
const MIN_LANE_HEIGHT = 150;
const MIN_LANE_WIDTH = 600;

const ViewLane = Record({
  id: undefined,
  name: undefined,
  height: MIN_LANE_HEIGHT,
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

const CurrentWorkflow = Record({
  lanesWidth: MIN_LANE_WIDTH,
  lanes: List(),
  activities: List(),
  transitions: Map(),
  focusedObject: undefined,
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

function getViewLanes(process) {
  const activities = process.activities;
  const partitions = activities.groupBy(act => act.laneId);
  const maxByLane = partitions.map(
    activities => activities.map(getActivityBottom).max() + LANE_BUFFER
  );
  return process.lanes.reduce((accum, lane) => {
    const prevLane = accum.last();
    const y = prevLane ? prevLane.y + prevLane.height : 0;
    const tenativeHeight = maxByLane.get(lane.id, MIN_LANE_HEIGHT);
    const height = tenativeHeight < MIN_LANE_HEIGHT ?
      MIN_LANE_HEIGHT : tenativeHeight;
    return accum.push(ViewLane({
      y,
      height,
      id: lane.id,
      name: lane.name,
    }));
  }, List());
}

function getViewActivities(activities, lanes) {
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

function getViewTransistions(process, activities) {
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

export const getPackage = state => state.package;

export const getWorkflows = createSelector(
  getPackage,
  pack => pack.workflows
);

export const getCurrentWorkflow = createSelector(
  getPackage,
  pack => {
    const currentWf = pack.currentWorkflow;
    if (!currentWf) {
      return CurrentWorkflow();
    }
    const lanes = getViewLanes(currentWf);
    const baseActivites = currentWf.activities;
    const activities = getViewActivities(baseActivites, lanes);
    const transitions = getViewTransistions(currentWf, activities);
    const lanesWidth = baseActivites.map(getActivityRight).max() + LANE_BUFFER;
    let { focusedObject } = currentWf;
    if (focusedObject && focusedObject.type === 'activity') {
      const focusId = focusedObject.object.id;
      focusedObject = activities.find(act => act.id === focusId);
    }
    return CurrentWorkflow({
      focusedObject,
      lanes,
      lanesWidth,
      activities,
      transitions,
    });
  }
);