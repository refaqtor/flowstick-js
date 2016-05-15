import undoable from 'redux-undo-immutable';
import { Record, Map, List } from 'immutable';

import * as WorkflowActions from '../actions/workflow';
import * as PackageActions from '../actions/package';

export const Workflow = Record({
  id: undefined,
  name: undefined,
  scrollX: 0,
  activities: List(),
  lanes: List(),
  transitions: Map(),
  current: false,
});

export const Activity = Record({
  id: undefined,
  name: undefined,
  laneId: undefined,
  focused: false,
  hovered: false,
  x: 0,
  relativeY: 0,
  draggingDeltaY: 0,
  draggingDeltaX: 0,
});

export const Point = Record({
  x: 0, y: 0,
});

const Lane = Record({
  id: undefined,
  performers: List(),
});

export const Segment = Record({
  to: undefined,
  from: undefined,
  toDraggingDeltaX: 0,
  toDraggingDeltaY: 0,
  fromDraggingDeltaX: 0,
  fromDraggingDeltaY: 0,
});

export const Transition = Record({
  id: undefined,
  segments: List(),
  focused: false,
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
        segments: List(trans.segments.map(({ to, from }) =>
          Segment({
            to: typeof to === 'object' ? Point(to) : to,
            from: typeof from === 'object' ? Point(from) : from,
          })
        )),
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

const STATE_FOCUS_LOOKUP = { transition: 'transitions', activity: 'activities' };

function unfocusAll(workflows, workflowId) {
  return updateThings(workflows, workflowId, oldWf =>
    oldWf.merge({
      transitions: oldWf.transitions.map(tran => tran.set('focused', false)),
      activities: oldWf.activities.map(act => act.set('focused', false)),
    })
  );
}

function updateFinishedSegments(segment, toOrFrom, hoveredActivityId) {
  return oldSegments =>
    oldSegments.map(oldSeg => {
      const { toDraggingDeltaX, toDraggingDeltaY,
        fromDraggingDeltaX, fromDraggingDeltaY } = oldSeg;
      let { to, from } = oldSeg;
      if (typeof to !== 'string') {
        to = Point({
          x: Math.max(0, to.x + toDraggingDeltaX),
          y: Math.max(0, to.y + toDraggingDeltaY),
        });
      }
      if (typeof from !== 'string') {
        from = Point({
          x: Math.max(0, from.x + fromDraggingDeltaX),
          y: Math.max(0, from.y + fromDraggingDeltaY),
        });
      }
      return oldSeg.merge({
        to, from,
        toDraggingDeltaX: 0, toDraggingDeltaY: 0,
        fromDraggingDeltaX: 0, fromDraggingDeltaY: 0,
      });
    })
    .update(segment, oldSeg => {
      return hoveredActivityId ?
        oldSeg.set(toOrFrom, hoveredActivityId) :
        oldSeg;
    });
}

function moveSegment(toOrFrom, deltaX, deltaY) {
  const xProp = `${toOrFrom}DraggingDeltaX`;
  const yProp = `${toOrFrom}DraggingDeltaY`;
  return oldSegment => oldSegment.merge({
    [xProp]: oldSegment[xProp] + deltaX,
    [yProp]: oldSegment[yProp] + deltaY,
  });
}

export function workflowsReducer(workflows, action) {
  switch (action.type) {

  case PackageActions.SET_CURRENT_WORKFLOW: {
    const { workflowId } = action;
    return workflows.map(wf => {
      return wf.id === workflowId ?
        wf.merge({ current: true }) :
        wf.merge({ current: false });
    });
  }

  case WorkflowActions.STOP_MOVE_TRANSITION_MARKER: {
    const { workflowId, transitionId, segment, toOrFrom,
            hoveredActivityId } = action;
    const updateSegments = updateFinishedSegments(
      segment, toOrFrom, hoveredActivityId);
    return updateThings(workflows, workflowId, oldWf =>
      oldWf.merge({
        activities: oldWf.activities.map(act => act.set('hovered', false)),
        transitions: oldWf.transitions.update(transitionId, oldTrans =>
          oldTrans.update('segments', updateSegments)),
      })
    );
  }

  case WorkflowActions.MOVE_TRANSITION_MARKER: {
    const { workflowId, transitionId, segment, toOrFrom,
            deltaX, deltaY, hoveredActivityId } = action;
    return updateThings(workflows, workflowId, oldWf =>
      oldWf.merge({
        activities: oldWf.activities.map(act =>
          act.set(
            'hovered',
            Boolean(hoveredActivityId && act.id === hoveredActivityId)
          )
        ),
        transitions: oldWf.transitions.update(transitionId, oldTrans => {
          const segUpdate = moveSegment(toOrFrom, deltaX, deltaY);
          const segPlusOne = segment + 1;
          return oldTrans.update('segments', oldSegments => {
            let newSegments = oldSegments.update(segment, segUpdate);
            if (toOrFrom === 'to' && newSegments.size > segPlusOne) {
              const segNextUpdate = moveSegment('from', deltaX, deltaY);
              newSegments = newSegments.update(segPlusOne, segNextUpdate);
            }
            return newSegments;
          });
        }),
      })
    );
  }

  case WorkflowActions.UNFOCUS_ALL:
    return unfocusAll(workflows, action.workflowId);

  case WorkflowActions.FOCUS_OBJECT: {
    const { workflowId, objectId, objectType } = action;
    const typething = STATE_FOCUS_LOOKUP[objectType];
    if (!typething) { return workflows; }
    const unfocused = unfocusAll(workflows, workflowId);
    return updateThings(unfocused, workflowId, oldWf =>
      oldWf.merge({
        [typething]: oldWf[typething].map(oldthing => {
          return oldthing.id === objectId ?
            oldthing.set('focused', true) :
            oldthing;
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

  case WorkflowActions.SCROLL_WORKFLOW: {
    const { workflowId, scrollX } = action;
    return updateThings(workflows, workflowId, oldWf =>
      oldWf.set('scrollX', Math.max(0, scrollX))
    );
  }

  case PackageActions.FINISH_PACKAGE_LOAD_SUCCESS:
    return constructWorkflowsState(action.workflows);

  default:
    return workflows;

  }
}

const INCLUDE_ACTIONS = [
  WorkflowActions.STOP_MOVE_ACTIVITY,
  WorkflowActions.STOP_MOVE_TRANSITION_MARKER,
];
const EXCLUDE_HISTORY = [
  WorkflowActions.MOVE_ACTIVITY,
  WorkflowActions.MOVE_TRANSITION_MARKER,
];
export default undoable(workflowsReducer, {
  actionFilter: action => INCLUDE_ACTIONS.indexOf(action.type) > -1,
  historyFilter: action => EXCLUDE_HISTORY.indexOf(action.type) === -1,
  undoType: WorkflowActions.UNDO,
  redoType: WorkflowActions.REDO,
  limit: 1000,
});
