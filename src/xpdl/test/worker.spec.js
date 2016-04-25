/* eslint-env mocha */
import expect from 'unexpected';
import Promise from 'bluebird';
import { spy } from 'sinon';

import { __RewireAPI__ as rewire } from '../worker.js';

describe('XPDL Worker', () => {

  /**
   * For these tests, the worker is run in the same thread, so we
   * can send events with `process.emit('message', ...);`.
   */

  const XMLString = '<xml></xml>';
  let origSend, whenSentResolve;

  beforeEach(() => {
    origSend = process.send;
    process.send = spy(msg => { whenSentResolve(msg); });
  });

  afterEach(() => {
    process.send = origSend;
  });

  it('should handle meaningless messages.', () => {
    process.emit('message', {}); // No crashes is good...
  });

  describe('READ', () => {

    function fakePromiseFunction() {
      const fakefunc = spy(() => {
        fakefunc.$promise = new Promise((resolve, reject) => {
          fakefunc.$resolve = resolve;
          fakefunc.$reject = reject;
        });
        return fakefunc.$promise;
      });
      return fakefunc;
    }

    let fakeReadFile, fakeStringParse, fakeXMLParse;

    beforeEach(() => {
      fakeReadFile = fakePromiseFunction();
      rewire.__Rewire__('readFile', fakeReadFile);

      fakeStringParse = fakePromiseFunction();
      fakeXMLParse = fakePromiseFunction();
      const fakeXPDL = {
        parseXMLString: fakeStringParse,
        parseXMLToXPDL: fakeXMLParse,
      };
      rewire.__Rewire__('xpdl', fakeXPDL);
    });

    afterEach(() => {
      rewire.__ResetDependency__('readFile');
      rewire.__ResetDependency__('xpdl');
    });

    it('should handle errors thrown by fileread.', () => {
      return new Promise((resolve) => {
        whenSentResolve = resolve;
        process.emit('message', { readFile: 'testfn' });
        fakeReadFile.$reject('errro!!!');
      }).then(msg => {
        expect(fakeReadFile.calledWith('testfn'), 'to be truthy');
        expect(fakeReadFile.calledOnce, 'to be truthy');
        expect(fakeStringParse.called, 'to be falsy');
        expect(fakeXMLParse.called, 'to be falsy');
        expect(msg, 'to equal', { readError: 'errro!!!', readOf: 'testfn' });
      });
    });

    it('should handle errors thrown by the XML parsing.', () => {
      return new Promise((resolve) => {
        whenSentResolve = resolve;
        process.emit('message', { readFile: 'testfn2' });
        fakeReadFile.$promise.then(() => {
          fakeStringParse.$reject('bad xml!');
        });
        fakeReadFile.$resolve(XMLString);
      }).then(msg => {
        expect(fakeReadFile.calledWith('testfn2'), 'to be truthy');
        expect(fakeReadFile.calledOnce, 'to be truthy');
        expect(fakeStringParse.calledWith(XMLString), 'to be truthy');
        expect(fakeStringParse.calledOnce, 'to be truthy');
        expect(fakeXMLParse.called, 'to be falsy');
        expect(msg, 'to equal', { readError: 'bad xml!', readOf: 'testfn2' });
      });
    });

    it('should passed parsed XPDL up.', () => {
      return new Promise((resolve) => {
        whenSentResolve = resolve;
        process.emit('message', { readFile: 'testfn3' });
        fakeReadFile.$promise.then(() => {
          fakeStringParse.$resolve('some xml data');
          return fakeStringParse.$promise;
        }).then(() => {
          fakeXMLParse.$resolve('a parsed xpdl!');
        });
        fakeReadFile.$resolve(XMLString);
      }).then(msg => {
        expect(fakeReadFile.calledWith('testfn3'), 'to be truthy');
        expect(fakeReadFile.calledOnce, 'to be truthy');
        expect(fakeStringParse.calledWith(XMLString), 'to be truthy');
        expect(fakeStringParse.calledOnce, 'to be truthy');
        expect(fakeXMLParse.calledWith('some xml data'), 'to be truthy');
        expect(fakeXMLParse.calledOnce, 'to be truthy');
        expect(msg, 'to equal', { readResult: 'a parsed xpdl!', readOf: 'testfn3' });
      });
    });

  }); // end READ describe

});
