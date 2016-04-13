/* eslint-env mocha */
import expect from 'unexpected';
import { spy } from 'sinon';

import { parsePackage, __RewireAPI__ as rewire } from '../Package';

describe('XPDL Package', () => {

  let fakePools, fakeWorkflows;
  let fakeParsePools, fakeParseWorkflows;

  beforeEach(() => {
    fakeParsePools = spy(() => fakePools);
    fakeParseWorkflows = spy(() => fakeWorkflows);
    rewire.__Rewire__('parsePools', fakeParsePools);
    rewire.__Rewire__('parseWorkflows', fakeParseWorkflows);
  });

  afterEach(() => {
    rewire.__ResetDependency__('parsePools');
    rewire.__ResetDependency__('parseWorkflows');
  });

  it('should parse out workflows and pools, passing in the pools.', () => {
    fakePools = { fake: 'pools' };
    fakeWorkflows = [{ fake: 'workflows' }];
    const pack = { atest: 'package' };
    const res = parsePackage(pack);
    expect(res, 'to equal', { workflows: fakeWorkflows });
    expect(fakeParsePools.calledWith(pack), 'to be truthy');
    expect(fakeParseWorkflows.calledWith(pack, fakePools), 'to be truthy');
  });

});
