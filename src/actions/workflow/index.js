import { HALF_ACTIVITY_HEIGHT } from '../../components/Workflow/Activity';

export const MOVE_ACTIVITY = 'MOVE_ACTIVITY';
export const STOP_MOVE_ACTIVITY = 'STOP_MOVE_ACTIVITY';

export function dragActivity(activityId, deltaX, deltaY) {
  return {
    type: MOVE_ACTIVITY,
    activityId,
    deltaY,
    deltaX,
  };
}

export function stopDragActivity(activityId, activityY, lanes) {
  const activityMiddleY = activityY + HALF_ACTIVITY_HEIGHT;
  const lane = lanes.reduce((accum, lane) => {
    if ( lane.y < activityMiddleY ) {
      return lane;
    }
    return accum;
  }, lanes.get(0, {}));
  return {
    type: STOP_MOVE_ACTIVITY,
    laneId: lane.id,
    relativeY: Math.max(activityY - lane.y, 0),
    activityId,
  };
}
