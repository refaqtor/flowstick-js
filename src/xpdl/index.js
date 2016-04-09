import { Parser } from 'xml2js';
import { promisify } from 'bluebird';
import { readFile } from 'fs';

const readFileAsync = promisify(readFile);
const parser = new Parser({
  explicitChildren: true,
  preserveChildrenOrder: true,
});
const parseXPDLString = promisify(parser.parseString);

function parseXPDL(xml) {
  const lanes = xml['xpdl:Package']['xpdl:Pools'][0].$$[0]['xpdl:Lanes'][0].$$
    .map(lane => {
      const id = lane.$.Id;
      const name = lane.$.Name;
      const performers = lane['xpdl:Performers'][0].$$
        .map(peformer => peformer._);
      return { id, name, performers };
    });
  const process = xml['xpdl:Package']['xpdl:WorkflowProcesses'][0].$$[0];
  const transitions = process['xpdl:Transitions'][0].$$
    .map(trans => {
      const id = trans.$.Id;
      const toAct = trans.$.To;
      const fromAct = trans.$.From;
      const anchors = trans['xpdl:ConnectorGraphicsInfos'][0].$$
        .filter(graphicsInfo =>
          graphicsInfo.$.Style === 'NO_ROUTING_ORTHOGONAL' && graphicsInfo.$$)
        .reduce((accum, graphicsInfo) => accum.concat(
          graphicsInfo.$$.map(cord => {
            const { XCoordinate, YCoordinate } = cord.$;
            return { x: parseInt(XCoordinate), y: parseInt(YCoordinate) };
          })
        ), []);
      const toPoints = anchors.concat([toAct]);
      const fromPoints = [fromAct].concat(anchors);
      const segments = toPoints.map((toPoint, index) => {
        return { from: fromPoints[index], to: toPoint };
      });
      return { id, segments };
    });
  const name = process.$.Name;
  const id = process.$.Id;
  const activities = process['xpdl:Activities'][0].$$
    .map(act => {
      const id = act.$.Id;
      const name = act.$.Name;
      const graphicsInfo = act['xpdl:NodeGraphicsInfos'][0]
                              ['xpdl:NodeGraphicsInfo'][0];
      const laneId = graphicsInfo.$.LaneId;
      const positionData = graphicsInfo['xpdl:Coordinates'][0].$;
      const x = parseInt(positionData.XCoordinate);
      const relativeY = parseInt(positionData.YCoordinate);
      return { id, name, x, relativeY, laneId };
    });
  return { id, name, activities, lanes, transitions };
}

export function loadProcessXPDL(filename) {
  return readFileAsync(filename)
    .then(contents => {
      return parseXPDLString(contents);
    })
    .then(parseXPDL);
}
