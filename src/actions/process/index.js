import { loadProcessXPDL } from '../../xpdl';

export const START_PROCESS_LOAD = 'START_PROCESS_LOAD';
export const FINISH_PROCESS_LOAD_SUCCESS = 'FINISH_PROCESS_LOAD_SUCCESS';
export const MOVE_ACTIVITY = 'MOVE_ACTIVITY';
export const STOP_MOVE_ACTIVITY = 'STOP_MOVE_ACTIVITY';

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
