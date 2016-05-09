import { HALF_ACTIVITY_HEIGHT } from '../../components/Workflow/Activity';

export const UNDO = 'wf_UNDO';
export const REDO = 'wf_REDO';
export const MOVE_TRANSITION_MARKER = 'wf_MOVE_TRANSITION_MARKER';
export const STOP_MOVE_TRANSITION_MARKER = 'wf_STOP_MOVE_TRANSITION_MARKER';
export const MOVE_ACTIVITY = 'wf_MOVE_ACTIVITY';
export const STOP_MOVE_ACTIVITY = 'wf_STOP_MOVE_ACTIVITY';
export const FOCUS_OBJECT = 'wf_FOCUS_OBJECT';
export const UNFOCUS_ALL = 'wf_UNFOCUS_ALL_OBJECTS';

export function redo() {
  return { type: REDO };
}

export function undo() {
  return { type: UNDO };
}

function computeHoveredAct({ activities, transitions }, transId, seg, toOrFrom,
                           realX, realY) {
  const lastSegIndex = transitions.get(transId).segments.size - 1;
  if (toOrFrom === 'from' && seg !== 0 ||
      toOrFrom === 'to' && seg !== lastSegIndex) {
    return;
  }
  const isContainedByAct = act =>
    realY >= act.y && realY <= act.y + 60 &&
    realX >= act.x && realX <= act.x + 90;
  const lastHoveredAct = activities.filter(isContainedByAct).last();
  return lastHoveredAct ? lastHoveredAct.id : undefined;
}

export function stopDragTransitionMarker(workflow, transitionId, segment, toOrFrom,
                                         realX, realY) {
  const workflowId = workflow.id;
  const hoveredActivityId = computeHoveredAct(
    workflow, transitionId, segment, toOrFrom, realX, realY);
  return {
    type: STOP_MOVE_TRANSITION_MARKER,
    workflowId, transitionId, segment, toOrFrom, hoveredActivityId,
  };
}

export function dragTransitionMarker(workflow, transitionId, segment,
                                     toOrFrom, deltaX, deltaY, realX, realY) {
  const workflowId = workflow.id;
  const hoveredActivityId = computeHoveredAct(
    workflow, transitionId, segment, toOrFrom, realX, realY);
  return {
    type: MOVE_TRANSITION_MARKER,
    hoveredActivityId, workflowId, transitionId, segment, toOrFrom, deltaX, deltaY,
  };
}

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

export function unfocusAllObjects(workflowId) {
  return {
    type: UNFOCUS_ALL,
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
