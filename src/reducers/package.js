import { Map, Record, List } from 'immutable';

import WorkflowReducer from './workflow';
import * as PackageActions from '../actions/package';

const Activity = Record({
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

const Workflow = Record({
  id: undefined,
  name: undefined,
  loaded: false,
  activities: List(),
  lanes: List(),
  transitions: Map(),
});

const Package = Record({
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
      const lanes = List(workflow.lanes.map(Lane));
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
        loaded: true,
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
