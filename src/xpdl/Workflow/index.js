/* @flow */
import { safeChildGet } from '../../xpdl';
import { parseActivities } from './Activity';
import { parseTransitions } from './Transition';

import type { XMLChildren } from '../../xpdl';
import type { XMLPackage } from '../Package';
import type { XPDLPools, XPDLLanes } from '../Pool';
import type { XPDLActivities, XMLActivities } from './Activity';
import type { XPDLTransitions, XMLTransitions } from './Transition';

export type XMLWorkflow = {
  $: {
    Id: string;
    Name: string;
  };
  'xpdl:Activities': XMLChildren<XMLActivities>;
  'xpdl:Transitions': XMLChildren<XMLTransitions>;
};
export type XMLWorkflows = XMLChildren<XMLWorkflow>;
export type XPDLWorkflows = {
  id: string;
  name: string;
  activities: XPDLActivities;
  transitions: XPDLTransitions;
  lanes: XPDLLanes;
};

export function parseWorkflows(pack: XMLPackage, pools: XPDLPools): XPDLWorkflows {
  const workflows = safeChildGet(pack, 'xpdl:WorkflowProcesses').$$ || [];
  return workflows.map((workflow, index) => {
    const name = workflow.$.Name;
    const id = workflow.$.Id;
    const lanes = pools[index];
    const transitions = parseTransitions(workflow);
    const activities = parseActivities(workflow);
    return { name, id, lanes, transitions, activities };
  });
}
