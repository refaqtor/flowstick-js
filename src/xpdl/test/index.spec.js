/* eslint-env mocha */
import expect from 'unexpected';
import { spy } from 'sinon';
import { Promise } from 'bluebird';

import { loadPackageXPDL, __RewireAPI__ as rewire } from '../../xpdl';

describe('XPDL', () => {

  const noFileError = { error: 'no file' };
  const parseError = { error: 'bad xml' };
  const fileResult = '<xml></xml>';
  let failure;
  let fileSytemPromise, fileSytemResolve, fileSytemReject, readFileSpy;
  let xmlParseResolve, xmlParseReject, xmlParseSpy;

  beforeEach(() => {
    failure = spy();
    readFileSpy = spy(() => {
      fileSytemPromise = new Promise((resolve, reject) => {
        fileSytemResolve = resolve;
        fileSytemReject = reject;
      });
      return fileSytemPromise;
    });
    xmlParseSpy = spy(() => {
      return new Promise((resolve, reject) => {
        xmlParseResolve = resolve;
        xmlParseReject = reject;
      });
    });
    rewire.__Rewire__('readFileAsync', readFileSpy);
    rewire.__Rewire__('parseXMLString', xmlParseSpy);
  });

  afterEach(() => {
    rewire.__ResetDependency__('readFile');
    rewire.__ResetDependency__('parseXMLString');
  });

  describe('Errors', () => {

    it('should handle errors thrown by fileread.', () => {
      const prom = loadPackageXPDL('nofilename')
        .catch(failure)
        .finally(() => {
          expect(readFileSpy.calledOnce, 'to be truthy');
          expect(readFileSpy.calledWith('nofilename'), 'to be truthy');
          expect(xmlParseSpy.called, 'to be falsy');
          expect(failure.calledWith(noFileError), 'to be truthy');
        });
      fileSytemReject(noFileError);
      return prom;
    });

    it('should handle errors thrown by the XML parsing.', () => {
      const prom = loadPackageXPDL('filename')
        .catch(failure)
        .finally(() => {
          expect(readFileSpy.calledOnce, 'to be truthy');
          expect(readFileSpy.calledWith('filename'), 'to be truthy');
          expect(xmlParseSpy.calledOnce, 'to be truthy');
          expect(xmlParseSpy.calledWith(fileResult), 'to be truthy');
          expect(failure.calledWith(parseError), 'to be truthy');
        });
      fileSytemPromise.then(() => {
        xmlParseReject(parseError);
      });
      fileSytemResolve(fileResult);
      return prom;
    });

  }); // end errors describe

  describe('Success', () => {

    let xmlObj, fakeParsePackage;

    beforeEach(() => {
      fakeParsePackage = spy(() => xmlObj);
      xmlObj = undefined;
      rewire.__Rewire__('parsePackage', fakeParsePackage);
    });

    afterEach(() => {
      rewire.__ResetDependency__('parsePackage');
    });

    it('should parse xpdl packages.', () => {
      xmlObj = { 'xpdl:Package': 'test' };
      const prom = loadPackageXPDL('filename')
        .catch(failure)
        .finally(() => {
          expect(readFileSpy.calledOnce, 'to be truthy');
          expect(readFileSpy.calledWith('filename'), 'to be truthy');
          expect(xmlParseSpy.calledOnce, 'to be truthy');
          expect(xmlParseSpy.calledWith(fileResult), 'to be truthy');
          expect(failure.called, 'to be falsy');
          expect(fakeParsePackage.calledWith('test'), 'to be truthy');
        });
      fileSytemPromise.then(() => {
        xmlParseResolve(xmlObj);
      });
      fileSytemResolve(fileResult);
      return prom;
    });

  }); // end Success describe

});
