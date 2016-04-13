/* eslint-env mocha */
import expect from 'unexpected';

import { parseTransitions } from '../Transition';

describe('XPDL Transition', () => {

  it('should work with missing transitions.', () => {
    const workflow = {};
    const res = parseTransitions(workflow);
    expect(res, 'to equal', []);
  });

  it('should parse ids, to and froms.', () => {
    const workflow = {
      'xpdl:Transitions': [{
        $$: [
          { $: { Id: 'testid1', To: 'to', From: 'from' } },
          { $: { Id: 'testid2', To: 'to2', From: 'from2' } },
        ],
      }],
    };
    const res = parseTransitions(workflow);
    expect(res.length, 'to be', 2);
    expect(res[0].id, 'to be', 'testid1');
    expect(res[0].segments, 'to equal', [
      { from: 'from', to: 'to' },
    ]);
    expect(res[1].id, 'to be', 'testid2');
    expect(res[1].segments, 'to equal', [
      { from: 'from2', to: 'to2' },
    ]);
  });

  it('should parse out segments with anchors.', () => {
    const firstGfxInfos = [{
      $$: [
        { $: { Style: 'NO_ROUTING_ORTHOGONAL' } },
        { $: { Style: 'SOMETING ELSE' } },
        { $: { Style: 'NO_ROUTING_ORTHOGONAL' },
          $$: [
            { $: { XCoordinate: '123', YCoordinate: '123' } },
          ],
        },
        { $: { Style: 'NO_ROUTING_ORTHOGONAL' },
          $$: [
            { $: { XCoordinate: '2123', YCoordinate: '2123' } },
            { $: { XCoordinate: '2121', YCoordinate: '2121' } },
          ],
        },
      ],
    }];
    const secondGfxInfos = [{
      $$: [
        { $: { Style: 'NO_ROUTING_ORTHOGONAL' },
          $$: [{
            $: { XCoordinate: '4312', YCoordinate: '312' },
          }],
        },
      ],
    }];
    const workflow = {
      'xpdl:Transitions': [{
        $$: [
          { $: { Id: 'testid1', To: 'act1', From: 'act2' },
            'xpdl:ConnectorGraphicsInfos': firstGfxInfos },
          { $: { Id: 'testid2', To: 'act3', From: 'act2' },
            'xpdl:ConnectorGraphicsInfos': secondGfxInfos },
        ],
      }],
    };
    const res = parseTransitions(workflow);
    expect(res.length, 'to be', 2);
    expect(res[0].segments, 'to equal', [
      { from: 'act2', to: { x: 123, y: 123 } },
      { from: { x: 123, y: 123 }, to: { x: 2123, y: 2123 } },
      { from: { x: 2123, y: 2123 }, to: { x: 2121, y: 2121 } },
      { from: { x: 2121, y: 2121 }, to: 'act1' },
    ]);
    expect(res[1].segments, 'to equal', [
      { from: 'act2', to: { x: 4312, y: 312 } },
      { from: { x: 4312, y: 312 }, to: 'act3' },
    ]);
  });

});
