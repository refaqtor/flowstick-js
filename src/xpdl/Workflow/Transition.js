/* @flow */
import { safeChildGet } from '../../xpdl';

import type { XPDLPoint } from '../../xpdl';
import type { XMLWorkflow } from '../Workflow';

type XMLTransition = {
  $: {
    Id: string;
    To: string;
    From: string;
  };
};
export type XMLTransitions = {
  $$: Array<XMLTransition>;
};
type XPDLSegment = {
  from: XPDLPoint;
  to: XPDLPoint;
};
type XPDLSegments = Array<XPDLSegment>;
export type XPDLTransition = {
  id: string;
  segments: XPDLSegments;
};
export type XPDLTransitions = Array<XPDLTransition>;

export function parseTransitions(workflow: XMLWorkflow): XPDLTransitions {
  const transitions = safeChildGet(workflow, 'xpdl:Transitions').$$ || [];
  return transitions.map(trans => {
    const id = trans.$.Id;
    const toAct = trans.$.To;
    const fromAct = trans.$.From;
    const anchors = (safeChildGet(trans, 'xpdl:ConnectorGraphicsInfos').$$ || [])
      .filter(graphicsInfo =>
        graphicsInfo.$.Style === 'NO_ROUTING_ORTHOGONAL' && graphicsInfo.$$)
      .reduce((accum, graphicsInfo) =>
        accum.concat(graphicsInfo.$$.map(cord => {
          const { XCoordinate, YCoordinate } = cord.$;
          return { x: parseInt(XCoordinate), y: parseInt(YCoordinate) };
        })), []);
    const toPoints = anchors.concat([toAct]);
    const fromPoints = [fromAct].concat(anchors);
    const segments = toPoints.map((toPoint, index) => {
      return { from: fromPoints[index], to: toPoint };
    });
    return { id, segments };
  });
}

