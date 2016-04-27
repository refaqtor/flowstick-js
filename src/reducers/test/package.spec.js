/* eslint-env mocha */
import { List } from 'immutable';
import expect from 'unexpected';

import * as PackageActions from '../../actions/package';
import packageReducer, { Package, __RewireAPI__ as rewire } from '../package';

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
      workflows: List([{ any: 'Object' }]),
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

  describe('Workflows Reducer Callthrough', () => {

    let workflowReducerResult;

    beforeEach(() => {
      rewire.__Rewire__('WorkflowsReducer', () => workflowReducerResult);
    });

    afterEach(() => {
      rewire.__ResetDependency__('WorkflowsReducer');
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
      workflowReducerResult = List([1]);
      const statePackage = Package({ workflows: List([2]) });
      const res = packageReducer(statePackage, {});
      expect(res, 'not to be', statePackage);
      expect(res.workflows, 'to be', workflowReducerResult);
    });
  });

});
