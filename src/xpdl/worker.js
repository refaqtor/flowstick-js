const Promise = require('bluebird');
const fsReadFile = require('fs').readFile;
const readFile = Promise.promisify(fsReadFile);

require('babel-register');
const xpdl = require('../xpdl');

process.on('message', msg => {
  if (msg.readFile) {
    const filename = msg.readFile;
    readFile(filename)
      .then(xpdl.parseXMLString)
      .then(xpdl.parseXMLToXPDL)
      .then(readResult => {
        process.send({ readResult, readOf: filename });
      }, readError => {
        process.send({ readError, readOf: filename });
      });
  }
});
