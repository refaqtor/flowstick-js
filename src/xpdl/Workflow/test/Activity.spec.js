/* eslint-env mocha */
import expect from 'unexpected';

import { parseActivities } from '../Activity';

describe('XPDL Activity', () => {

  it('should work with missing activities.', () => {
    const workflow = {};
    const res = parseActivities(workflow);
    expect(res, 'to equal', []);
  });

  it('should parse ids and names.', () => {
    const workflow = {
      'xpdl:Activities': [{
        $$: [
          { $: { Id: 'testactid', Name: 'testactname' } },
          { $: { Id: 'testactid2', Name: 'testactname2' } },
        ],
      }],
    };
    const res = parseActivities(workflow);
    expect(res.length, 'to be', 2);
    expect(res[0].id, 'to be', 'testactid');
    expect(res[0].name, 'to be', 'testactname');
    expect(res[1].id, 'to be', 'testactid2');
    expect(res[1].name, 'to be', 'testactname2');
  });

  it('should parse out the lane id, x and relative y positions.', () => {
    const firstGraphics = [{
      'xpdl:NodeGraphicsInfo': [{
        $: { LaneId: 'lane1' },
        'xpdl:Coordinates': [{
          $: { XCoordinate: '123', YCoordinate: '456' },
        }],
      }],
    }];
    const secondGraphics = [{
      'xpdl:NodeGraphicsInfo': [{
        $: { LaneId: 'lane2' },
        'xpdl:Coordinates': [{}],
      }],
    }];
    const workflow = {
      'xpdl:Activities': [{
        $$: [
          { $: { }, 'xpdl:NodeGraphicsInfos': firstGraphics },
          { $: { }, 'xpdl:NodeGraphicsInfos': secondGraphics },
        ],
      }],
    };
    const res = parseActivities(workflow);
    expect(res.length, 'to be', 2);
    expect(res[0].laneId, 'to be', 'lane1');
    expect(res[0].x, 'to be', 123);
    expect(res[0].relativeY, 'to be', 456);
    expect(res[1].laneId, 'to be', 'lane2');
    expect(res[1].x, 'to be', NaN);
    expect(res[1].relativeY, 'to be', NaN);
  });

});
