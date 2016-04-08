import { loadProcessXPDL } from '../../xpdl';

export const START_PROCESS_LOAD = 'START_PROCESS_LOAD';
export const FINISH_PROCESS_LOAD_SUCCESS = 'FINISH_PROCESS_LOAD_SUCCESS';
export const MOVE_ACTIVITY = 'MOVE_ACTIVITY';

export function loadProcess(name) {
  return dispatch => {
    dispatch({ type: START_PROCESS_LOAD });
    return loadProcessXPDL(name)
      .then(procData => {
        dispatch({ type: FINISH_PROCESS_LOAD_SUCCESS, ...procData });
      }, err => {
        // TODO handle error
        console.error(err);
      });
  };
}

export function dragActivity(activityId, newX, newY) {
  return {
    type: MOVE_ACTIVITY,
    activityId,
    newX,
    newY,
  };
}
