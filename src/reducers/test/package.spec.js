/* eslint-env mocha */
import { List } from 'immutable';
import expect from 'unexpected';

import * as PackageActions from '../../actions/package';
import packageReducer, { Package, Workflow,
                         __RewireAPI__ as rewire } from '../package';

describe('Package Reducer', () => {

  const halfLoadedPackage = Package({
    filename: 'somefilename.xpdl',
    currentWorkflow: undefined,
    loaded: false,
    workflows: List(),
  });

  it('should have a default state without any interesting propeties.', () => {
    expect(packageReducer(undefined, {}).toJS(), 'to equal', {
      filename: undefined,
      currentWorkflow: undefined,
      loaded: false,
      workflows: [],
    });
  });

  it('should, on package start load, nuke the state and set filename.', () => {
    const statefulPackage = Package({
      filename: 'somefilename.xpdl',
      currentWorkflow: Workflow(),
      loaded: true,
      workflows: List([Workflow()]),
    });
    const action = {
      type: PackageActions.START_PACKAGE_LOAD,
      filename: 'newfilename.xpdl',
    };
    expect(packageReducer(statefulPackage, action).toJS(), 'to equal', {
      filename: 'newfilename.xpdl',
      currentWorkflow: undefined,
      loaded: false,
      workflows: [],
    });
  });

  it('should handle workflow-less loads.', () => {
    const action = {
      type: PackageActions.FINISH_PACKAGE_LOAD_SUCCESS,
      workflows: [],
    };
    expect(packageReducer(halfLoadedPackage, action).toJS(), 'to equal', {
      filename: 'somefilename.xpdl',
      currentWorkflow: undefined,
      loaded: true,
      workflows: [],
    });
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
                      segments: [{ from: '1', to: 10 }, { from: 10, to: '2' }] }],
    };
    const action = {
      type: PackageActions.FINISH_PACKAGE_LOAD_SUCCESS,
      workflows: [
        actionWorkflow1,
        actionWorkflow2,
      ],
    };
    const expectedWorkflow1 = {
      lanes: [], activities: [], transitions: {}, id: '1', name: 'One' };
    const expectedWorkflow2 = {
      id: '2', name: 'Two',
      lanes: [{ id: 'lane1', performers: ['perf1'] }],
      activities: [{ id: 'act1', name: 'act1name', draggingDeltaX: 0,
                     draggingDeltaY: 0, x: 5, relativeY: 10, laneId: 'lane1' }],
      transitions: {
        trans1: {
          id: 'trans1',
          segments: [{ from: '1', to: 10 }, { from: 10, to: '2' }],
        },
      },
    };
    expect(packageReducer(halfLoadedPackage, action).toJS(), 'to equal', {
      filename: 'somefilename.xpdl',
      currentWorkflow: expectedWorkflow1,
      loaded: true,
      workflows: [
        expectedWorkflow1,
        expectedWorkflow2,
      ],
    });
  });

  describe('Current Workflow Reducer', () => {

    let workflowReducerResult;

    beforeEach(() => {
      rewire.__Rewire__('WorkflowReducer', () => workflowReducerResult);
    });

    afterEach(() => {
      rewire.__ResetDependency__('WorkflowReducer');
    });

    it('should not create new state when workflow reducer does not change ' +
       'the underlying state.', () => {
      const originalCurrentWorkflow = workflowReducerResult = {};
      const statePackage = Package({
        currentWorkflow: originalCurrentWorkflow,
      });
      expect(packageReducer(statePackage, {}), 'to be', statePackage);
    });

    it('should update workflows when workflow reducers does change the ' +
       'underlying state.', () => {
      workflowReducerResult = Workflow({ id: '1' });
      const originalCurrentWorkflow = Workflow({ id: '1' });
      const otherWorkflow = Workflow();
      const statePackage = Package({
        currentWorkflow: originalCurrentWorkflow,
        workflows: List([otherWorkflow, originalCurrentWorkflow]),
      });
      const res = packageReducer(statePackage, {});
      expect(res, 'not to be', statePackage);
      expect(res.currentWorkflow, 'to be', workflowReducerResult);
      expect(res.workflows.get(0), 'to be', otherWorkflow);
      expect(res.workflows.get(1), 'to be', workflowReducerResult);
    });
  });

});
