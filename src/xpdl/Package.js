/* @flow */
import { parsePools } from './Pool';
import type { XMLPools } from './Pool';
import { parseWorkflows } from './Workflow';
import type { XPDLWorkflows, XMLWorkflows } from './Workflow';

export type XMLPackage = {
  'xpdl:Pools'?: XMLPools;
  'xpdl:WorkflowProcesses'?: XMLWorkflows;
};
export type XPDLPackage = {
  workflows: XPDLWorkflows;
};

export function parsePackage(pack: XMLPackage): XPDLPackage {
  const pools = parsePools(pack);
  const workflows = parseWorkflows(pack, pools);
  return { workflows };
}
