/* eslint-env mocha */
import { List } from 'immutable';
import expect from 'unexpected';

import * as PackageActions from '../../actions/package';
import packageReducer, { Package, Workflow,
                         __RewireAPI__ as rewire } from '../package';

describe('Package Reducer', () => {

  const halfLoadedPackage = Package({
    filename: 'somefilename.xpdl',
    loaded: false,
    workflows: List(),
  });

  it('should have a default state without any interesting propeties.', () => {
    expect(packageReducer(undefined, {}).toJS(), 'to equal', {
      filename: undefined,
      loaded: false,
      workflows: [],
    });
  });

  it('should, on package start load, nuke the state and set filename.', () => {
    const statefulPackage = Package({
      filename: 'somefilename.xpdl',
      loaded: true,
      workflows: List([Workflow()]),
    });
    const action = {
      type: PackageActions.START_PACKAGE_LOAD,
      filename: 'newfilename.xpdl',
    };
    expect(packageReducer(statefulPackage, action).toJS(), 'to equal', {
      filename: 'newfilename.xpdl',
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
      loaded: true,
      workflows: [
        expectedWorkflow1,
        expectedWorkflow2,
      ],
    });
  });

  describe('Workflows Reducer Callthrough', () => {

    let workflowReducerResult;

    beforeEach(() => {
      rewire.__Rewire__('WorkflowReducer', () => workflowReducerResult);
    });

    afterEach(() => {
      rewire.__ResetDependency__('WorkflowReducer');
    });

    it('should not create new state when workflow reducer does not change ' +
       'the underlying state.', () => {
      const originalWorkflows = workflowReducerResult = {};
      const statePackage = Package({
        workflows: originalWorkflows,
      });
      expect(packageReducer(statePackage, {}), 'to be', statePackage);
    });

    it('should update workflows when workflow reducers does change the ' +
       'underlying state.', () => {
      const workflow = Workflow();
      const otherWorkflow = Workflow();
      workflowReducerResult = List([workflow.merge({ id: 'new' }), otherWorkflow]);
      const statePackage = Package({
        workflows: List([workflow, otherWorkflow]),
      });
      const res = packageReducer(statePackage, {});
      expect(res, 'not to be', statePackage);
      expect(res.workflows, 'to be', workflowReducerResult);
    });
  });

});
