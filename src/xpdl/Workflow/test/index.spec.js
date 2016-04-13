/* eslint-env mocha */
import expect from 'unexpected';
import { spy } from 'sinon';

import { parseWorkflows, __RewireAPI__ as rewire } from '../../Workflow';

describe('XPDL Workflow', () => {

  let fakeParseActivities, fakeParseTransitions;
  let fakeActivities, fakeTransitions;

  beforeEach(() => {
    fakeParseTransitions = spy(() => fakeTransitions);
    fakeParseActivities = spy(() => fakeActivities);
    rewire.__Rewire__('parseTransitions', fakeParseTransitions);
    rewire.__Rewire__('parseActivities', fakeParseActivities);
  });

  afterEach(() => {
    rewire.__ResetDependency__('parseTransitions');
    rewire.__ResetDependency__('parseActivities');
  });

  it('should work when there are no workflows.', () => {
    const pack = {};
    const pools = [];
    const res = parseWorkflows(pack, pools);
    expect(res, 'to equal', []);
  });

  it('should parse out names and ids.', () => {
    const pack = {
      'xpdl:WorkflowProcesses': [{
        $$: [
          { $: { Id: 'testid', Name: 'testname' } },
          { $: { Id: 'testid2', Name: 'testname2' } },
        ],
      }],
    };
    const pools = [];
    const res = parseWorkflows(pack, pools);
    expect(res.length, 'to be', 2);
    expect(res[0].id, 'to be', 'testid');
    expect(res[0].name, 'to be', 'testname');
    expect(res[1].id, 'to be', 'testid2');
    expect(res[1].name, 'to be', 'testname2');
  });

  it('should take lanes from the same order in the xpdl.', () => {
    const pack = {
      'xpdl:WorkflowProcesses': [{
        $$: [{ $: {} }, { $: {} }],
      }],
    };
    const pools = ['onelanes', 'twolanes'];
    const res = parseWorkflows(pack, pools);
    expect(res.length, 'to be', 2);
    expect(res[0].lanes, 'to be', 'onelanes');
    expect(res[1].lanes, 'to be', 'twolanes');
  });

  it('should return parsed transitions and activities.', () => {
    fakeActivities = 'parsedacts';
    fakeTransitions = 'parsedtransitions';
    const pack = {
      'xpdl:WorkflowProcesses': [{
        $$: [{ $: {} }],
      }],
    };
    const pools = ['onelanes', 'twolanes'];
    const res = parseWorkflows(pack, pools);
    expect(res.length, 'to be', 1);
    expect(res[0].transitions, 'to be', 'parsedtransitions');
    expect(res[0].activities, 'to be', 'parsedacts');
    expect(fakeParseTransitions.calledWith({ $: {} }), 'to be truthy');
    expect(fakeParseActivities.calledWith({ $: {} }), 'to be truthy');
  });

}); // end Pools describe
