/* eslint-env mocha */
import expect from 'unexpected';

import { parsePools } from '../Pool';

describe('XPDL Pool', () => {

  it('should parse lanes when there are no pools.', () => {
    const pack = {
      'xpdl:Pools': [{}],
    };
    const res = parsePools(pack);
    expect(res, 'to equal', []);
  });

  it('should parse lanes when pools have no lanes.', () => {
    const pack = {
      'xpdl:Pools': [{
        $$: [
        { 'xpdl:Lanes': [{}] },
        { 'xpdl:NotLanes': [{}] },
        ],
      }],
    };
    const res = parsePools(pack);
    expect(res, 'to equal', [[], []]);
  });

  it('should parse lanes from pools.', () => {
    const firstLanes = [
      { $: { Id: 'one', Name: 'One Lane' }, 'xpdl:Performers': [{}] },
      { $: { Id: 'two', Name: 'Two Lane' },
        'xpdl:Performers': [{ $$: [{ _: 'perf1' }, { _: 'perf2' }] }] },
    ];
    const secondLanes = [];
    const thirdLanes = [
      { $: { Id: 'two2', Name: 'TwoTwo Lane' },
        'xpdl:Performers': [{ $$: [{ _: 'perf2' }] }] },
    ];
    const pack = {
      'xpdl:Pools': [{
        $$: [
          { 'xpdl:Lanes': [{ $$: firstLanes }] },
          { 'xpdl:Lanes': [{ $$: secondLanes }] },
          { 'xpdl:Lanes': [{ $$: thirdLanes }] },
        ],
      }],
    };
    const res = parsePools(pack);
    const firstExpectedLanes = [
      { id: 'one', name: 'One Lane', performers: [] },
      { id: 'two', name: 'Two Lane', performers: ['perf1', 'perf2'] },
    ];
    const secondExpectedLanes = [];
    const thirdExpectedLanes = [
      { id: 'two2', name: 'TwoTwo Lane', performers: ['perf2'] },
    ];
    expect(res, 'to equal', [
      firstExpectedLanes, secondExpectedLanes, thirdExpectedLanes]);
  });

}); // end Pools describe
