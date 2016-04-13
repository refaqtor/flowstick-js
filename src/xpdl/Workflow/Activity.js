/* @flow */
import { safeChildGet } from '../../xpdl';

import type { XMLWorkflow } from '../Workflow';

type XMLActivity = {
  $: { Id: string; Name: string; };
};
export type XMLActivities = {
  $$: Array<XMLActivity>;
};
type XPDLActivity = {
  id: string;
  name: string;
  x: number;
  relativeY: number;
  laneId: string;
};
export type XPDLActivities = Array<XPDLActivity>;

export function parseActivities(workflow: XMLWorkflow): XPDLActivities {
  const activities = safeChildGet(workflow, 'xpdl:Activities').$$ || [];
  return activities.map(act => {
    const id = act.$.Id;
    const name = act.$.Name;
    const graphicsInfos = safeChildGet(act, 'xpdl:NodeGraphicsInfos');
    const graphicsInfo = safeChildGet(graphicsInfos, 'xpdl:NodeGraphicsInfo');
    const laneId = (graphicsInfo.$ || {}).LaneId;
    const positionData = safeChildGet(graphicsInfo, 'xpdl:Coordinates').$ || {};
    const x = parseInt(positionData.XCoordinate);
    const relativeY = parseInt(positionData.YCoordinate);
    return { id, name, x, relativeY, laneId };
  });
}

