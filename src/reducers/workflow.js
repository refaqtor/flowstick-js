import { Record, Map, List } from 'immutable';
import * as WorkflowActions from '../actions/workflow';
import * as PackageActions from '../actions/package';

export const Workflow = Record({
  id: undefined,
  name: undefined,
  activities: List(),
  lanes: List(),
  transitions: Map(),
  focusedObject: undefined,
  current: false,
});

export const Activity = Record({
  id: undefined,
  name: undefined,
  laneId: undefined,
  x: 0,
  relativeY: 0,
  draggingDeltaY: 0,
  draggingDeltaX: 0,
});

const FocusObject = Record({
  object: undefined,
  type: undefined,
});

const Lane = Record({
  id: undefined,
  performers: List(),
});

const Segment = Record({
  to: undefined,
  from: undefined,
});

const Transition = Record({
  id: undefined,
  segments: List(),
});

function constructWorkflowsState(actionWorkflows) {
  return List(actionWorkflows.map(workflow => {
    const activities = List(workflow.activities.map(Activity));
    const lanes = List(workflow.lanes.map(
      lane => Lane({ id: lane.id, performers: List(lane.performers) })));
    const transitions = Map(workflow.transitions.map(trans => [
      trans.id,
      Transition({
        id: trans.id,
        segments: List(trans.segments.map(Segment)),
      }),
    ]));
    return Workflow({
      id: workflow.id,
      name: workflow.name,
      lanes,
      activities,
      transitions,
    });
  }));
}

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

export default function workflowsReducer(workflows, action) {
  switch (action.type) {

  case PackageActions.SET_CURRENT_WORKFLOW: {
    const { workflowId } = action;
    return workflows.map(wf => {
      return wf.id === workflowId ?
        wf.merge({ current: true }) :
        wf.merge({ current: false });
    });
  }

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
        x: Math.max(0, oldAct.x + oldAct.draggingDeltaX),
      })
    );
  }

  case PackageActions.FINISH_PACKAGE_LOAD_SUCCESS:
    return constructWorkflowsState(action.workflows);

  default:
    return workflows;

  }
}
