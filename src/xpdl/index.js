/* @flow */
import { Parser } from 'xml2js';
import Promise, { promisify } from 'bluebird';

import { parsePackage } from './Package';
import { readFile } from '../file';
import type { XMLPackage, XPDLPackage } from './Package';

type RawXML = { 'xpdl:Package': XMLPackage };

type XMLLevel<C> = { $$?: Array<C> };
export type XMLChildren<C> = Array<XMLLevel<C>>;
export type XPDLPoint = string | { x: number, y: number };

const parser = new Parser({
  explicitChildren: true,
  preserveChildrenOrder: true,
});
const parseXMLString = promisify(parser.parseString);

function parseXMLToXPDL(xml: RawXML): XPDLPackage {
  return parsePackage(xml['xpdl:Package']);
}

export function safeChildGet(obj: Object, key: string): Object {
  return obj[key] ? obj[key][0] : {};
}

export function loadPackageXPDL(filename: string): Promise<XPDLPackage> {
  return readFile(filename)
    .then(parseXMLString)
    .then(parseXMLToXPDL);
}
