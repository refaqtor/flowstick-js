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

export function stopDragActivity(activityId) {
  return {
    type: STOP_MOVE_ACTIVITY,
    activityId,
  };
}
