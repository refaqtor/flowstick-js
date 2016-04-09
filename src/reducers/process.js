import { List, Record, Map } from 'immutable';

import * as ProcessActions from '../actions/process';

const Activity = Record({
  id: undefined,
  name: undefined,
  x: 0,
  y: 0,
  laneId: undefined,
});

const Lane = Record({
  id: undefined,
  performers: List(),
  height: 0,
  y: 0,
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

export default function process(state = initialState, action) {
  let activities;
  switch (action.type) {

  case ProcessActions.START_PROCESS_LOAD:
    return initialState;

  case ProcessActions.FINISH_PROCESS_LOAD_SUCCESS:
    activities = List(action.activities.map(Activity));
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

  case ProcessActions.MOVE_ACTIVITY:
    const { activityId, newX, newY } = action;
    // Can this be done better?
    const foundIndex = state.activities.findIndex(act => act.id === activityId);
    const newAct = state.activities.get(foundIndex).merge({
      x: newX,
      y: newY,
    });
    activities = state.activities.set(foundIndex, newAct);
    return state.merge({ loaded: true, activities });

  default:
    return state;

  }
}
