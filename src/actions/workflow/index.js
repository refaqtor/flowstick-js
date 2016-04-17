import { HALF_ACTIVITY_HEIGHT } from '../../components/Workflow/Activity';

export const MOVE_ACTIVITY = 'wf_MOVE_ACTIVITY';
export const STOP_MOVE_ACTIVITY = 'wf_STOP_MOVE_ACTIVITY';
export const FOCUS_OBJECT = 'wf_FOCUS_OBJECT';

export function dragActivity(workflowId, activityId, deltaX, deltaY) {
  return {
    type: MOVE_ACTIVITY,
    workflowId, activityId, deltaY, deltaX,
  };
}

export function stopDragActivity(workflowId, activityId, activityY, lanes) {
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
    workflowId,
  };
}

export function focusObject(workflowId, objectType, object) {
  return {
    type: FOCUS_OBJECT,
    objectType,
    object,
    workflowId,
  };
}
