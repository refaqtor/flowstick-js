import { Record, List, Map } from 'immutable';
import { createSelector } from 'reselect';

import { ACTIVITY_HEIGHT, ACTIVITY_WIDTH } from '../../components/Workflow/Activity';

const HALF_ACTIVITY_HEIGHT = ACTIVITY_HEIGHT / 2;
const HALF_ACTIVITY_WIDTH = ACTIVITY_WIDTH / 2;

const WIDTH_LANE_BUFFER = 100;
const HEIGHT_LANE_BUFFER = 20;
const MIN_LANE_HEIGHT = 150;
const MIN_LANE_WIDTH = 900;

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
  focused: false,
  ofInterest: false,
  x: 0,
  y: 0,
});

const ViewSegment = Record({
  toActivity: false,
  fromActivity: false,
  from: undefined,
  to: undefined,
  toOffsetX: 0, toOffsetY: 0,
  fromOffsetX: 0, fromOffsetY: 0,
});

const CurrentWorkflow = Record({
  id: undefined,
  lanesWidth: MIN_LANE_WIDTH,
  lanes: List(),
  activities: List(),
  transitions: Map(),
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
    activities => activities.map(getActivityBottom).max() + HEIGHT_LANE_BUFFER
  );
  return process.lanes.reduce((accum, lane) => {
    const prevLane = accum.last();
    const y = prevLane ? prevLane.y + prevLane.height : 0;
    const tenativeHeight = maxByLane.get(lane.id, MIN_LANE_HEIGHT);
    const height = Math.max(tenativeHeight, MIN_LANE_HEIGHT);
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
      focused: act.focused,
      ofInterest: act.hovered,
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
        return ViewSegment({
          toActivity, fromActivity, to, from,
          toOffsetX: seg.toDraggingDeltaX,
          toOffsetY: seg.toDraggingDeltaY,
          fromOffsetX: seg.fromDraggingDeltaX,
          fromOffsetY: seg.fromDraggingDeltaY,
        });
      }),
    })
  );
}

export const getPackage = state => state.package;

export const getLoading = createSelector(getPackage, pack => !pack.loaded);

export const getWorkflows = createSelector(
  getPackage,
  pack => pack.workflows && pack.workflows.present || List()
);

export const getCurrentWorkflow = createSelector(
  getWorkflows,
  workflows => {
    const currentWf = workflows.find(wf => wf.current);
    if (!currentWf) { return undefined; }
    const lanes = getViewLanes(currentWf);
    const baseActivites = currentWf.activities;
    const activities = getViewActivities(baseActivites, lanes);
    const transitions = getViewTransistions(currentWf, activities);
    const lanesWidth = Math.max(
      baseActivites.map(getActivityRight).max() + WIDTH_LANE_BUFFER,
      MIN_LANE_WIDTH
    );
    return CurrentWorkflow({
      id: currentWf.id,
      lanes,
      lanesWidth,
      activities,
      transitions,
    });
  }
);
