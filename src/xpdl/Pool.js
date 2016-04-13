/* @flow */
import { safeChildGet } from '../xpdl';
import type { XMLChildren } from '../xpdl';
import type { XMLPackage } from './Package';

type XMLPerformer = { _: string; };
type XMLLane = {
  $: { Id: string; Name: string; 'xpdl:Performers'?: XMLChildren<XMLPerformer>; };
};
type XMLLanes = XMLChildren<XMLLane>;
type XMLPool = {
  'xpdl:Lanes'?: XMLLanes;
};
export type XMLPools = XMLChildren<XMLPool>;

type XPDLLane = { id: string; name: string; performers: Array<string> };
export type XPDLLanes = Array<XPDLLane>;
export type XPDLPools = Array<XPDLLanes>;

export function parsePools(pack: XMLPackage): XPDLPools {
  const pools = safeChildGet(pack, 'xpdl:Pools').$$ || [];
  return pools.map(pool => {
    const lanes = safeChildGet(pool, 'xpdl:Lanes').$$ || [];
    return lanes.map(lane => {
      const id = lane.$.Id;
      const name = lane.$.Name;
      const performers = (safeChildGet(lane, 'xpdl:Performers').$$ || [])
        .map(peformer => peformer._);
      return { id, name, performers };
    });
  });
}
