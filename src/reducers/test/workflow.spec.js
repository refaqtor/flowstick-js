/* eslint-env mocha */
import { List } from 'immutable';
import expect from 'unexpected';

import { Activity, Workflow } from '../package';
import * as WorkflowActions from '../../actions/workflow';
import workflowReducer from '../workflow';

describe('Workflow Reducer', () => {

  const unchangedWf = Workflow();
  const unchangedAct = Activity({ id: '2' });

  it('should have a default state of whatever was passed in.', () => {
    const anyDefault = {};
    expect(workflowReducer(anyDefault, {}), 'to be', anyDefault);
  });

  it('should, on move activity, compute the new state of dragginDeltas.', () => {
    const original = Workflow({
      id: '4',
      activities: List([
        unchangedAct,
        Activity({ id: '1', laneId: 'orginalLane',
                   draggingDeltaX: 0, draggingDeltaY: 0 }),
      ]),
    });
    const originalWorkflows = List([original, unchangedWf]);
    const firstAction = {
      type: WorkflowActions.MOVE_ACTIVITY,
      deltaX: 10, deltaY: -50, activityId: '1', workflowId: '4',
    };
    const firstResultWfs = workflowReducer(originalWorkflows, firstAction);
    const firstResult = firstResultWfs.get(0);
    const firstChangedAct = firstResult.activities.get(1);
    expect(firstResultWfs.size, 'to be', 2);
    expect(firstResultWfs.get(1), 'to be', unchangedWf);
    expect(firstResult.activities.size, 'to be', 2);
    expect(firstResult.activities.get(0), 'to be', unchangedAct);
    expect(firstChangedAct.id, 'to be', '1');
    expect(firstChangedAct.laneId, 'to be', 'orginalLane');
    expect(firstChangedAct.draggingDeltaX, 'to be', 10);
    expect(firstChangedAct.draggingDeltaY, 'to be', -50);

    const secondAction = {
      type: WorkflowActions.MOVE_ACTIVITY,
      deltaX: -10, deltaY: -250, activityId: '1', workflowId: '4',
    };
    const secondResultWfs = workflowReducer(firstResultWfs, secondAction);
    const secondResult = secondResultWfs.get(0);
    const secondChangedAct = secondResult.activities.get(1);
    expect(secondResultWfs.size, 'to be', 2);
    expect(secondResultWfs.get(1), 'to be', unchangedWf);
    expect(secondResult.activities.size, 'to be', 2);
    expect(secondResult.activities.get(0), 'to be', unchangedAct);
    expect(secondChangedAct.id, 'to be', '1');
    expect(secondChangedAct.laneId, 'to be', 'orginalLane');
    expect(secondChangedAct.draggingDeltaX, 'to be', 0);
    expect(secondChangedAct.draggingDeltaY, 'to be', -300);
  });

  it('should, on end of activity move, record x, laneId, and relativeY.', () => {
    const original = Workflow({
      id: '2',
      activities: List([
        unchangedAct,
        Activity({ id: '1', laneId: 'orginalLane', x: 100,
                   draggingDeltaX: -10, draggingDeltaY: 1000 }),
      ]),
    });
    const originalWorkflows = List([unchangedWf, original]);
    const firstAction = {
      type: WorkflowActions.STOP_MOVE_ACTIVITY,
      laneId: 'newLaneId', relativeY: 24, activityId: '1', workflowId: '2',
    };
    const firstResultWfs = workflowReducer(originalWorkflows, firstAction);
    const firstResult = firstResultWfs.get(1);
    const firstChangedAct = firstResult.activities.get(1);
    expect(firstResultWfs.size, 'to be', 2);
    expect(firstResultWfs.get(0), 'to be', unchangedWf);
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
      laneId: 'lastlane', relativeY: 0, activityId: '1', workflowId: '2',
    };
    const secondResultWfs = workflowReducer(firstResultWfs, secondAction);
    const secondResult = secondResultWfs.get(1);
    const secondChangedAct = secondResult.activities.get(1);
    expect(secondResultWfs.size, 'to be', 2);
    expect(secondResultWfs.get(0), 'to be', unchangedWf);
    expect(secondResult.activities.size, 'to be', 2);
    expect(secondResult.activities.get(0), 'to be', unchangedAct);
    expect(secondChangedAct.id, 'to be', '1');
    expect(secondChangedAct.laneId, 'to be', 'lastlane');
    expect(secondChangedAct.draggingDeltaX, 'to be', 0);
    expect(secondChangedAct.draggingDeltaY, 'to be', 0);
    expect(secondChangedAct.relativeY, 'to be', 0);
    expect(secondChangedAct.x, 'to be', 90);
  });

  it('should ammend the workflow with a focused object.', () => {
    const original = List([Workflow({ id: '1' }), Workflow({ id: '2' })]);
    const newFocusObj = {};
    const action = {
      type: WorkflowActions.FOCUS_OBJECT,
      object: newFocusObj,
      objectType: 'anytype',
      workflowId: '1',
    };
    const res = workflowReducer(original, action);
    const changedWorkflow = res.get(0);
    const stateFocused = changedWorkflow.focusedObject;
    expect(res.size, 'to be', 2);
    expect(res.get(1), 'to be', original.get(1));
    expect(stateFocused.type, 'to be', 'anytype');
    expect(stateFocused.object, 'to be', newFocusObj);
  });

});
