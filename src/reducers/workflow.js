import { FocusObject } from './package';
import * as WorkflowActions from '../actions/workflow';

function updateThings(things, thingId, updater) {
  const foundIndex = things.findIndex(thing => thing.id === thingId);
  return foundIndex < 0 ? things : things.update(foundIndex, updater);
}

function updateActivity(workflows, workflowId, activityId, updater) {
  return updateThings(workflows, workflowId, oldWf =>
    oldWf.merge({
      activities: updateThings(oldWf.activities, activityId, updater),
    })
  );
}

export default function workflow(workflows, action) {
  switch (action.type) {

  case WorkflowActions.FOCUS_OBJECT: {
    const { workflowId, object, objectType } = action;
    return updateThings(workflows, workflowId, oldWf =>
      oldWf.merge({
        focusedObject: FocusObject({
          type: objectType,
          object,
        }),
      })
    );
  }

  case WorkflowActions.MOVE_ACTIVITY: {
    const { workflowId, activityId, deltaY, deltaX } = action;
    return updateActivity(workflows, workflowId, activityId, oldAct =>
      oldAct.merge({
        draggingDeltaX: oldAct.draggingDeltaX + deltaX,
        draggingDeltaY: oldAct.draggingDeltaY + deltaY,
      })
    );
  }

  case WorkflowActions.STOP_MOVE_ACTIVITY: {
    const { workflowId, activityId, laneId, relativeY } = action;
    return updateActivity(workflows, workflowId, activityId, oldAct =>
      oldAct.merge({
        laneId,
        relativeY,
        draggingDeltaX: 0,
        draggingDeltaY: 0,
        x: oldAct.x + oldAct.draggingDeltaX,
      })
    );
  }

  default:
    return workflows;

  }
}
