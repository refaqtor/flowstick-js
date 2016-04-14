import * as WorkflowActions from '../actions/workflow';

function updateActivity(activities, activityId, updater) {
  const foundIndex = activities.findIndex(act => act.id === activityId);
  return activities.update(foundIndex, updater);
}

export default function workflow(state, action) {
  switch (action.type) {

  case WorkflowActions.MOVE_ACTIVITY: {
    const { activityId, deltaY, deltaX } = action;
    const activities = updateActivity(state.activities, activityId, oldAct =>
      oldAct.merge({
        draggingDeltaX: oldAct.draggingDeltaX + deltaX,
        draggingDeltaY: oldAct.draggingDeltaY + deltaY,
      })
    );
    return state.merge({ activities });
  }

  case WorkflowActions.STOP_MOVE_ACTIVITY: {
    const { activityId } = action;
    const activities = updateActivity(state.activities, activityId, oldAct =>
      oldAct.merge({
        draggingDeltaX: 0,
        draggingDeltaY: 0,
        x: oldAct.x + oldAct.draggingDeltaX,
        relativeY: oldAct.relativeY + oldAct.draggingDeltaY,
      })
    );
    return state.merge({ activities });
  }

  default:
    return state;

  }
}
