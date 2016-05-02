import { Record } from 'immutable';

import WorkflowsReducer from './workflow';
import * as PackageActions from '../actions/package';

export const Package = Record({
  filename: undefined,
  loaded: false,
  workflows: undefined,
});

function updateWorkflows(pack, action) {
  const oldwfs = pack.workflows;
  const newwfs = WorkflowsReducer(oldwfs, action);
  if (oldwfs !== newwfs) {
    // Do a shallow check to avoid updates to the component tree when
    // the workflowReducer does nothing.
    return pack.merge({ workflows: newwfs });
  }
  return pack;
}

const initialState = Package();

export default function pack(state = initialState, action) {
  let newState = state;
  switch (action.type) {

  case PackageActions.START_PACKAGE_LOAD:
    newState = initialState.set('filename', action.filename);
    break;

  case PackageActions.FINISH_PACKAGE_LOAD_SUCCESS:
    newState = state.merge({ loaded: true });
    break;

  }
  return updateWorkflows(newState, action);
}
