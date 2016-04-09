import { List, Record, Map } from 'immutable';

import * as ProcessActions from '../actions/process';

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

const Process = Record({
  id: undefined,
  name: undefined,
  loaded: false,
  activities: List(),
  lanes: List(),
  transitions: Map(),
});

const initialState = Process();

function updateActivity(activities, activityId, updater) {
  const foundIndex = activities.findIndex(act => act.id === activityId);
  return activities.update(foundIndex, updater);
}

export default function process(state = initialState, action) {
  switch (action.type) {

  case ProcessActions.START_PROCESS_LOAD:
    return initialState;

  case ProcessActions.FINISH_PROCESS_LOAD_SUCCESS: {
    const activities = List(action.activities.map(Activity));
    const lanes = List(action.lanes.map(Lane));
    const transistionsListing = action.transitions.map(trans => [
      trans.id,
      Transition({
        id: trans.id,
        segments: List(trans.segments.map(Segment)),
      }),
    ]);
    const transitions = Map(transistionsListing);
    return Process({
      id: action.id,
      name: action.name,
      loaded: true,
      lanes,
      activities,
      transitions,
    });
  }

  case ProcessActions.MOVE_ACTIVITY: {
    const { activityId, deltaY, deltaX } = action;
    const activities = updateActivity(state.activities, activityId, oldAct =>
      oldAct.merge({
        draggingDeltaX: oldAct.draggingDeltaX + deltaX,
        draggingDeltaY: oldAct.draggingDeltaY + deltaY,
      })
    );
    return state.merge({ activities });
  }

  case ProcessActions.STOP_MOVE_ACTIVITY: {
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
