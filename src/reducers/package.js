import { Map, Record, List } from 'immutable';

import WorkflowReducer from './workflow';
import * as PackageActions from '../actions/package';

export const Activity = Record({
  id: undefined,
  name: undefined,
  laneId: undefined,
  x: 0,
  relativeY: 0,
  draggingDeltaY: 0,
  draggingDeltaX: 0,
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

export const FocusObject = Record({
  object: undefined,
  type: undefined,
});

export const Workflow = Record({
  id: undefined,
  name: undefined,
  activities: List(),
  lanes: List(),
  transitions: Map(),
  focusedObject: undefined,
});

export const Package = Record({
  filename: undefined,
  currentWorkflow: undefined,
  loaded: false,
  workflows: List(),
});

function updateCurrentWorkflow(pack, action) {
  const oldcur = pack.currentWorkflow;
  const newcur = WorkflowReducer(oldcur, action);
  if (newcur !== oldcur) {
    // Do a shallow check to avoid updates to the component tree when
    // the workflowReducer does nothing.
    const curIndex = pack.workflows.findIndex(wf => wf.id === newcur.id);
    const workflows = pack.workflows.set(curIndex, newcur);
    return pack.merge({
      workflows,
      currentWorkflow: newcur,
    });
  }
  return pack;
}

const initialState = Package();

export default function pack(state = initialState, action) {
  switch (action.type) {

  case PackageActions.START_PACKAGE_LOAD:
    return initialState.set('filename', action.filename);

  case PackageActions.FINISH_PACKAGE_LOAD_SUCCESS: {
    const workflows = action.workflows.map(workflow => {
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
    });
    return state.merge({
      loaded: true,
      currentWorkflow: workflows[0],
      workflows,
    });
  }

  default:
    return updateCurrentWorkflow(state, action);

  }
}
