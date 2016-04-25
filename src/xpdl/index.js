/* @flow */
import { fork } from 'child_process';
import { Parser } from 'xml2js';
import Promise, { promisify } from 'bluebird';

import { parsePackage } from './Package';
import type { XMLPackage, XPDLPackage } from './Package';

type RawXML = { 'xpdl:Package': XMLPackage };

type XMLLevel<C> = { $$?: Array<C> };
export type XMLChildren<C> = Array<XMLLevel<C>>;
export type XPDLPoint = string | { x: number, y: number };

const parser = new Parser({
  explicitChildren: true,
  preserveChildrenOrder: true,
});

let xmlWorker;

export const parseXMLString = promisify(parser.parseString);

export function parseXMLToXPDL(xml: RawXML): XPDLPackage {
  return parsePackage(xml['xpdl:Package']);
}

export function safeChildGet(obj: Object, key: string): Object {
  return obj[key] ? obj[key][0] : {};
}

export function primeWorker(): Object {
  if (!xmlWorker) {
    xmlWorker = fork('./src/xpdl/worker.js');
    xmlWorker.on('exit', () => {
      // TODO, report error.
      xmlWorker = null;
    });
  }
  return xmlWorker;
}

export function loadPackageXPDL(filename: string): Promise<XPDLPackage> {
  const worker = primeWorker();
  return new Promise((resolve, reject) => {
    if (!worker) {
      reject(new Error('There is no XPDL worker running.'));
    }
    const listener = msg => {
      if (msg.readOf !== filename) {
        return;
      }
      if (worker) {
        worker.removeListener('message', listener);
      }
      if (msg.readResult) {
        resolve(msg.readResult);
      } else if (msg.readError) {
        reject(new Error(msg.readError));
      }
    };
    worker.on('message', listener);
    worker.send({ readFile: filename });
  });
}
