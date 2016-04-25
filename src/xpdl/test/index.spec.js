/* eslint-env mocha */
import expect from 'unexpected';
import { spy } from 'sinon';

import { parseXMLToXPDL, primeWorker, loadPackageXPDL,
         __RewireAPI__ as rewire } from '../../xpdl';

describe('XPDL', () => {

  describe('parseXMLToXPDL', () => {

    before(() => {
      rewire.__Rewire__('parsePackage', arg => arg);
    });

    after(() => {
      rewire.__ResetDependency__('parsePackage');
    });

    it('should send the package through the xpdl pipeline.', () => {
      expect(parseXMLToXPDL({ 'xpdl:Package': 'test' }), 'to be', 'test');
    });

  }); // end parseXMLToXPDL describe

  describe('primeWorker', () => {

    let fakeForkedWorker;

    beforeEach(() => {
      const onSpy = spy();
      const fakeFork = moduleName => {
        expect(moduleName, 'to be defined');
        fakeForkedWorker = { on: onSpy };
        return fakeForkedWorker;
      };
      rewire.__Rewire__('fork', fakeFork);
    });

    afterEach(() => {
      rewire.__ResetDependency__('fork');
    });

    it('should fork out a worker thread.', () => {
      const res = primeWorker();
      expect(res, 'to be', fakeForkedWorker);
    });

    it('should restart the process any time it crashes.', () => {
      const first = primeWorker();
      expect(fakeForkedWorker.on.calledWith('exit'), 'to be truthy');

      const second = primeWorker();
      expect(first, 'to be', second);
      expect(fakeForkedWorker.on.callCount, 'to be', 1);

      fakeForkedWorker.on.firstCall.args[1]();
      const third = primeWorker();
      expect(third, 'not to be', second);
    });

  }); // end primeWorker describe

  describe('loadPackageXPDL', () => {

    let primeWorkerResult, removeSpy;

    function makeFakePrimeResult(sendFn) {
      removeSpy = spy();
      primeWorkerResult = {
        on(type, fn) {
          expect(type, 'to be', 'message');
          primeWorkerResult.$fn = fn;
        },
        send: sendFn,
        removeListener: removeSpy,
      };
    }

    beforeEach(() => {
      const fakePrimeWorker = () => primeWorkerResult;
      rewire.__Rewire__('primeWorker', fakePrimeWorker);
    });

    afterEach(() => {
      rewire.__ResetDependency__('primeWorker');
    });

    it('should properly error out when .', () => {
      return loadPackageXPDL().catch(err => {
        expect(err.message, 'to be', 'There is no XPDL worker running.');
      });
    });

    it('should throw errors correctly.', () => {
      makeFakePrimeResult(msg => {
        expect(msg, 'to equal', { readFile: 'tstfilname' });
        primeWorkerResult.$fn({ readOf: 'tstfilname', readError: 'testerr' });
      });
      return loadPackageXPDL('tstfilname')
        .catch(err => {
          expect(removeSpy.calledWith('message'), 'to be truthy');
          expect(err.message, 'to be', 'testerr');
        });
    });

    it('should send read messages to the worker and relay results.', () => {
      makeFakePrimeResult(msg => {
        expect(msg, 'to equal', { readFile: 'tstfilname' });
        primeWorkerResult.$fn({ readOf: 'tstfilname', readResult: 'testresult' });
      });
      return loadPackageXPDL('tstfilname')
        .then(result => {
          expect(removeSpy.calledWith('message'), 'to be truthy');
          expect(result, 'to be', 'testresult');
        });
    });

    it('should ignore messages for other requests.', () => {
      const rejectResolveSpy = spy();
      const fakePromise = function(fn) {
        fn(rejectResolveSpy, rejectResolveSpy);
      };
      rewire.__Rewire__('Promise', fakePromise);
      makeFakePrimeResult(msg => {
        expect(msg, 'to equal', { readFile: 'tstfilname' });
        primeWorkerResult.$fn({ readOf: 'someotherfile' });
      });
      loadPackageXPDL('tstfilname');
      expect(rejectResolveSpy.callCount, 'to be', 0);
      rewire.__ResetDependency__('Promise');
    });

  }); // end loadPackageXPDL describe

});
