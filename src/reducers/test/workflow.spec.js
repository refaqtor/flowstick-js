/* eslint-env mocha */
import { List } from 'immutable';
import expect from 'unexpected';

import { Activity, Workflow } from '../package';
import * as WorkflowActions from '../../actions/workflow';
import workflowReducer from '../workflow';

describe('Workflow Reducer', () => {

  const unchangedAct = Activity({ id: '2' });

  it('should have a default state of whatever was passed in.', () => {
    const anyDefault = {};
    expect(workflowReducer(anyDefault, {}), 'to be', anyDefault);
  });

  it('should, on move activity, compute the new state of dragginDeltas.', () => {
    const original = Workflow({
      activities: List([
        unchangedAct,
        Activity({ id: '1', laneId: 'orginalLane',
                   draggingDeltaX: 0, draggingDeltaY: 0 }),
      ]),
    });
    const firstAction = {
      type: WorkflowActions.MOVE_ACTIVITY,
      deltaX: 10, deltaY: -50, activityId: '1',
    };
    const firstResult = workflowReducer(original, firstAction);
    const firstChangedAct = firstResult.activities.get(1);
    expect(firstResult.activities.size, 'to be', 2);
    expect(firstResult.activities.get(0), 'to be', unchangedAct);
    expect(firstChangedAct.id, 'to be', '1');
    expect(firstChangedAct.laneId, 'to be', 'orginalLane');
    expect(firstChangedAct.draggingDeltaX, 'to be', 10);
    expect(firstChangedAct.draggingDeltaY, 'to be', -50);

    const secondAction = {
      type: WorkflowActions.MOVE_ACTIVITY,
      deltaX: -10, deltaY: -250, activityId: '1',
    };
    const secondResult = workflowReducer(firstResult, secondAction);
    const secondChangedAct = secondResult.activities.get(1);
    expect(secondResult.activities.size, 'to be', 2);
    expect(secondResult.activities.get(0), 'to be', unchangedAct);
    expect(secondChangedAct.id, 'to be', '1');
    expect(secondChangedAct.laneId, 'to be', 'orginalLane');
    expect(secondChangedAct.draggingDeltaX, 'to be', 0);
    expect(secondChangedAct.draggingDeltaY, 'to be', -300);
  });

  it('should, on end of activity move, record x, laneId, and relativeY.', () => {
    const original = Workflow({
      activities: List([
        unchangedAct,
        Activity({ id: '1', laneId: 'orginalLane', x: 100,
                   draggingDeltaX: -10, draggingDeltaY: 1000 }),
      ]),
    });
    const firstAction = {
      type: WorkflowActions.STOP_MOVE_ACTIVITY,
      laneId: 'newLaneId', relativeY: 24, activityId: '1',
    };
    const firstResult = workflowReducer(original, firstAction);
    const firstChangedAct = firstResult.activities.get(1);
    expect(firstResult.activities.size, 'to be', 2);
    expect(firstResult.activities.get(0), 'to be', unchangedAct);
    expect(firstChangedAct.id, 'to be', '1');
    expect(firstChangedAct.laneId, 'to be', 'newLaneId');
    expect(firstChangedAct.draggingDeltaX, 'to be', 0);
    expect(firstChangedAct.draggingDeltaY, 'to be', 0);
    expect(firstChangedAct.relativeY, 'to be', 24);
    expect(firstChangedAct.x, 'to be', 90);

    const secondAction = {
      type: WorkflowActions.STOP_MOVE_ACTIVITY,
      laneId: 'lastlane', relativeY: 0, activityId: '1',
    };
    const secondResult = workflowReducer(firstResult, secondAction);
    const secondChangedAct = secondResult.activities.get(1);
    expect(secondResult.activities.size, 'to be', 2);
    expect(secondResult.activities.get(0), 'to be', unchangedAct);
    expect(secondChangedAct.id, 'to be', '1');
    expect(secondChangedAct.laneId, 'to be', 'lastlane');
    expect(secondChangedAct.draggingDeltaX, 'to be', 0);
    expect(secondChangedAct.draggingDeltaY, 'to be', 0);
    expect(secondChangedAct.relativeY, 'to be', 0);
    expect(secondChangedAct.x, 'to be', 90);
  });

});
