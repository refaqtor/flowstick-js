/* eslint-env mocha */
import { Map, List } from 'immutable';
import expect from 'unexpected';

import { workflowsReducer, Activity, Workflow, Transition,
         Segment, Point } from '../workflow';
import * as WorkflowActions from '../../actions/workflow';
import * as PackageActions from '../../actions/package';

describe('Workflow Reducer', () => {

  const unchangedWf = Workflow();
  const unchangedAct = Activity({ id: '2' });

  it('should have a default state of whatever was passed in.', () => {
    const anyDefault = {};
    expect(workflowsReducer(anyDefault, {}), 'to be', anyDefault);
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
    const firstResultWfs = workflowsReducer(originalWorkflows, firstAction);
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
    const secondResultWfs = workflowsReducer(firstResultWfs, secondAction);
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
    const firstResultWfs = workflowsReducer(originalWorkflows, firstAction);
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
    const secondResultWfs = workflowsReducer(firstResultWfs, secondAction);
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

  it('should update a transition as focused.', () => {
    const wf1 = Workflow({ id: '1' });
    const wf2 = Workflow({
      id: '2',
      transitions: Map({
        '1': Transition({
          id: '1',
          focused: false,
        }),
        '2': Transition({
          id: '2',
          focused: true,
        }),
      }),
    });
    const original = List([wf1, wf2]);
    const action = {
      type: WorkflowActions.FOCUS_OBJECT,
      objectId: '1',
      objectType: 'transition',
      workflowId: '2',
    };
    const res = workflowsReducer(original, action);
    const changedWorkflow = res.get(1);
    expect(res.size, 'to be', 2);
    expect(res.get(0), 'to be', original.get(0));
    expect(changedWorkflow.transitions.get('1').toJS(), 'to satisfy', {
      id: '1', focused: true,
    });
    expect(changedWorkflow.transitions.get('2').toJS(), 'to satisfy', {
      id: '2', focused: false,
    });
  });

  it('should update a activity as focused.', () => {
    const wf1 = Workflow({ id: '1' });
    const wf2 = Workflow({
      id: '2',
      activities: List([
        unchangedAct,
        Activity({ id: '1' }),
      ]),
    });
    const original = List([wf1, wf2]);
    const action = {
      type: WorkflowActions.FOCUS_OBJECT,
      objectId: '1',
      objectType: 'activity',
      workflowId: '2',
    };
    const res = workflowsReducer(original, action);
    const changedWorkflow = res.get(1);
    expect(res.size, 'to be', 2);
    expect(res.get(0), 'to be', original.get(0));
    expect(changedWorkflow.activities.get(0), 'to be', unchangedAct);
    expect(changedWorkflow.activities.get(1).toJS(), 'to satisfy', {
      id: '1', focused: true,
    });
  });

  it('should not crash on focus unknown object.', () => {
    const wf = Workflow({ id: '1' });
    const original = List([wf]);
    const action = {
      type: WorkflowActions.FOCUS_OBJECT,
      objectType: 'UNKNOWN',
      workflowId: '1',
    };
    const res = workflowsReducer(original, action);
    expect(res, 'to be', original);
  });

  it('should unfocus all objects.', () => {
    const wf = Workflow({
      id: '1',
      activities: List([
        unchangedAct,
        Activity({ id: '1', focused: true }),
      ]),
      transitions: Map({
        '1': Transition({ id: '1', focused: true }),
        '2': Transition({ id: '2', focused: true }),
      }),
    });
    const original = List([wf]);
    const action = {
      type: WorkflowActions.UNFOCUS_ALL,
      workflowId: '1',
    };
    const res = workflowsReducer(original, action);
    expect(res.size, 'to be', 1);
    const newWf = res.get(0);
    expect(newWf.toJS(), 'to satisfy', {
      id: '1',
      activities: [{ id: '2', focused: false }, { id: '1', focused: false }],
      transitions: {
        '1': { id: '1', focused: false },
        '2': { id: '2', focused: false },
      },
    });
  });

  it('should work even when there is no matching activity.', () => {
    const wf = Workflow({
      id: '1',
      activities: List([unchangedAct]),
    });
    const orig = List([wf]);
    const action = { type: WorkflowActions.MOVE_ACTIVITY };
    const res = workflowsReducer(orig, action);
    expect(res, 'to be', orig);
  });

  it('should, on package finish, load in all the processed xpdl.', () => {
    const actionWorkflow1 = {
      id: '1',
      name: 'One',
      activities: [],
      transitions: [],
      lanes: [],
    };
    const actionWorkflow2 = {
      id: '2',
      name: 'Two',
      lanes: [{ id: 'lane1', performers: ['perf1'] }],
      activities: [{ id: 'act1', name: 'act1name',
                     x: 5, relativeY: 10, laneId: 'lane1' }],
      transitions: [{ id: 'trans1',
                      segments: [{ from: '1', to: { x: 10, y: 10 } },
                                 { from: { x: 10, y: 10 }, to: '2' }],
                   }],
    };
    const action = {
      type: PackageActions.FINISH_PACKAGE_LOAD_SUCCESS,
      workflows: [
        actionWorkflow1,
        actionWorkflow2,
      ],
    };
    const expectedWorkflow1 = {
      lanes: [], activities: [], transitions: {},
      id: '1', name: 'One', current: false, scrollX: 0 };
    const expectedWorkflow2 = {
      id: '2', name: 'Two',
      lanes: [{ id: 'lane1', performers: ['perf1'] }],
      activities: [{ id: 'act1', name: 'act1name', draggingDeltaX: 0, focused: false,
                     draggingDeltaY: 0, x: 5, hovered: false, relativeY: 10,
                     laneId: 'lane1' }],
      transitions: {
        trans1: {
          id: 'trans1',
          focused: false,
          segments: [{ from: '1', to: { x: 10, y: 10 },
                       toDraggingDeltaX: 0, toDraggingDeltaY: 0,
                       fromDraggingDeltaX: 0, fromDraggingDeltaY: 0 },
                     { from: { x: 10, y: 10 }, to: '2',
                       toDraggingDeltaX: 0, toDraggingDeltaY: 0,
                       fromDraggingDeltaX: 0, fromDraggingDeltaY: 0 }],
        },
      },
      current: false, scrollX: 0,
    };
    expect(workflowsReducer(List(), action).toJS(), 'to equal', [
      expectedWorkflow1,
      expectedWorkflow2,
    ]);
  });

  it('should keep track of the scroll position.', () => {
    const workflows1 = List([Workflow({ id: '1' })]);
    const action = {
      type: WorkflowActions.SCROLL_WORKFLOW,
      workflowId: '1',
      scrollX: 200,
    };
    const res1 = workflowsReducer(workflows1, action).toJS();
    expect(res1[0].scrollX, 'to be', 200);
  });

  it('should not allow a x position of less than 0.', () => {
    const workflows1 = List([
      Workflow({ activities: List([Activity({ draggingDeltaX: -10, x: 10 })]) }),
    ]);
    const action = { type: WorkflowActions.STOP_MOVE_ACTIVITY };
    const res1 = workflowsReducer(workflows1, action).toJS();
    expect(res1[0].activities[0].x, 'to be', 0);

    const workflows2 = List([
      Workflow({ activities: List([Activity({ draggingDeltaX: -11, x: 10 })]) }),
    ]);
    const res2 = workflowsReducer(workflows2, action).toJS();
    expect(res2[0].activities[0].x, 'to be', 0);
  });

  it('should keep track of current workflow state.', () => {
    const workflows1 = List([
      Workflow({ id: '0', current: false }),
      Workflow({ id: '1', current: true }),
    ]);
    const action = {
      type: PackageActions.SET_CURRENT_WORKFLOW,
      workflowId: '0',
    };
    const res1 = workflowsReducer(workflows1, action).toJS();
    expect(res1[0].current, 'to be truthy');
    expect(res1[1].current, 'to be falsy');

    const workflows2 = List([
      Workflow({ id: '0', current: false }),
      Workflow({ id: '1', current: false }),
    ]);
    const res2 = workflowsReducer(workflows2, action).toJS();
    expect(res2[0].current, 'to be truthy');
    expect(res2[1].current, 'to be falsy');
  });

  it('should move transitions.', () => {
    const workflows1 = List([
      Workflow({ id: '0', transitions: Map({
        '1': Transition({
          id: '1', segments: List([Segment(), Segment()]),
        }),
        '2': Transition({ id: '2' }),
      }) }),
      Workflow({ id: '1', current: true }),
    ]);
    const action = {
      type: WorkflowActions.MOVE_TRANSITION_MARKER,
      workflowId: '0', transitionId: '1', toOrFrom: 'to',
      deltaY: 10, deltaX: 15, segment: 1,
    };
    const res1 = workflowsReducer(workflows1, action);
    expect(res1.toJS()[0].transitions['1'].segments, 'to equal', [
      { toDraggingDeltaX: 0, toDraggingDeltaY: 0,
        fromDraggingDeltaX: 0, fromDraggingDeltaY: 0 },
      { toDraggingDeltaX: 15, toDraggingDeltaY: 10,
        fromDraggingDeltaX: 0, fromDraggingDeltaY: 0 },
    ]);

    const action2 = {
      type: WorkflowActions.MOVE_TRANSITION_MARKER,
      workflowId: '0', transitionId: '1', toOrFrom: 'to',
      deltaY: -5, deltaX: -10, segment: 0,
    };
    const res2 = workflowsReducer(res1, action2);
    expect(res2.toJS()[0].transitions['1'].segments, 'to equal', [
      { toDraggingDeltaX: -10, toDraggingDeltaY: -5,
        fromDraggingDeltaX: 0, fromDraggingDeltaY: 0 },
      { toDraggingDeltaX: 15, toDraggingDeltaY: 10,
        fromDraggingDeltaX: -10, fromDraggingDeltaY: -5 },
    ]);
  });

  it('should update hovered state on transition move.', () => {
    const workflows1 = List([
      Workflow({
        id: '0',
        activities: List([Activity({ id: '1' }), Activity({ id: '2' })]),
        transitions: Map({
          '1': Transition({
            id: '1', segments: List([Segment(), Segment()]),
          }),
        }),
      }),
      Workflow({ id: '1' }),
    ]);
    const action = {
      type: WorkflowActions.MOVE_TRANSITION_MARKER,
      workflowId: '0', transitionId: '1', toOrFrom: 'to',
      deltaY: 10, deltaX: 15, segment: 1, hoveredActivityId: '1',
    };
    const res1 = workflowsReducer(workflows1, action);
    expect(res1.toJS()[0].activities, 'to satisfy', [
      { id: '1', hovered: true },
      { id: '2', hovered: false },
    ]);

    const action2 = {
      type: WorkflowActions.MOVE_TRANSITION_MARKER,
      workflowId: '0', transitionId: '1', toOrFrom: 'to',
      deltaY: 10, deltaX: 15, segment: 1, hoveredActivityId: '2',
    };
    const res2 = workflowsReducer(res1, action2);
    expect(res2.toJS()[0].activities, 'to satisfy', [
      { id: '1', hovered: false },
      { id: '2', hovered: true },
    ]);
  });

  it('should update activities and transitions when the transition dragging ' +
     'is over.', () => {
    const seg1 = Segment({
      from: '1', to: Point({ x: 10, y: 10 }),
      toDraggingDeltaX: 10, toDraggingDeltaY: 20,
      fromDraggingDeltaX: 0, fromDraggingDeltaY: 0,
    });
    const seg2 = Segment({
      from: Point({ x: 10, y: 10 }), to: '2',
      toDraggingDeltaX: 0, toDraggingDeltaY: 0,
      fromDraggingDeltaX: 10, fromDraggingDeltaY: 20,
    });
    const workflows1 = List([
      Workflow({
        id: '0',
        activities: List([Activity({ id: '1', hovered: true }),
                          Activity({ id: '2' })]),
        transitions: Map({
          '1': Transition({
            id: '1', segments: List([seg1, seg2]),
          }),
        }),
      }),
      Workflow({ id: '1' }),
    ]);
    const action = {
      type: WorkflowActions.STOP_MOVE_TRANSITION_MARKER,
      workflowId: '0', transitionId: '1', toOrFrom: 'to', segment: 1,
    };
    const res1 = workflowsReducer(workflows1, action);
    expect(res1.toJS()[0].activities, 'to satisfy', [
      { id: '1', hovered: false },
      { id: '2', hovered: false },
    ]);
    expect(res1.toJS()[0].transitions['1'].segments, 'to equal', [
      { from: '1', to: { x: 20, y: 30 },
        toDraggingDeltaX: 0, toDraggingDeltaY: 0,
        fromDraggingDeltaX: 0, fromDraggingDeltaY: 0 },
      { from: { x: 20, y: 30 }, to: '2',
        toDraggingDeltaX: 0, toDraggingDeltaY: 0,
        fromDraggingDeltaX: 0, fromDraggingDeltaY: 0 },
    ]);

    const action2 = {
      type: WorkflowActions.STOP_MOVE_TRANSITION_MARKER,
      workflowId: '0', transitionId: '1', toOrFrom: 'to', segment: 1,
      hoveredActivityId: '1',
    };
    const res2 = workflowsReducer(res1, action2);
    expect(res2.toJS()[0].transitions['1'].segments, 'to equal', [
      { from: '1', to: { x: 20, y: 30 },
        toDraggingDeltaX: 0, toDraggingDeltaY: 0,
        fromDraggingDeltaX: 0, fromDraggingDeltaY: 0 },
      { from: { x: 20, y: 30 }, to: '1',
        toDraggingDeltaX: 0, toDraggingDeltaY: 0,
        fromDraggingDeltaX: 0, fromDraggingDeltaY: 0 },
    ]);
  });

});
