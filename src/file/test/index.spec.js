/* eslint-env mocha */
import expect from 'unexpected';

import { escapeFilename, getFilenameFromUserPrompt,
         __RewireAPI__ as rewire } from '../../file';

describe('File', () => {

  describe('escapeFilename', () => {

    it('should escape filenames for safety in urls.', () => {
      expect(escapeFilename(''), 'to be', '');
      expect(escapeFilename('test'), 'to be', 'test');
      expect(escapeFilename('/test/me/please'), 'to be', '%2Ftest%2Fme%2Fplease');
    });

  }); // end escapeFilename describe

  describe('getFilenameFromUserPrompt', () => {

    let showOpenDialogCb;

    before(() => {
      const fakeWindow = {};
      const fakeRemote = {
        getCurrentWindow() {
          return fakeWindow;
        },
        dialog: {
          showOpenDialog(win, opts, cb) {
            expect(win, 'to be', fakeWindow);
            showOpenDialogCb = cb;
          },
        },
      };
      rewire.__Rewire__('remote', fakeRemote);
    });

    after(() => {
      rewire.__ResetDependency__('remote');
    });

    it('should resolve with a single filename the user selected.', () => {
      const prom = getFilenameFromUserPrompt()
        .then(filename => {
          expect(filename, 'to be', 'userfilename');
        });
      showOpenDialogCb(['userfilename']);
      return prom;
    });

    it('should reject with a no filename error when user cancels.', () => {
      const prom = getFilenameFromUserPrompt()
        .catch(err => {
          expect(err.message, 'to be', 'No filename was selected.');
        });
      showOpenDialogCb(undefined);
      return prom;
    });

  }); // end getFilenameFromUserPrompt describe

});
