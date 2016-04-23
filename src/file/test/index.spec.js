/* eslint-env mocha */
import expect from 'unexpected';

import { escapeFilename } from '../../file';

describe('File', () => {

  describe('escapeFilename', () => {

    it('should escape filenames for safety in urls.', () => {
      expect(escapeFilename(''), 'to be', '');
      expect(escapeFilename('test'), 'to be', 'test');
      expect(escapeFilename('/test/me/please'), 'to be', '%2Ftest%2Fme%2Fplease');
    });

  }); // end escapeFilename describe

});
