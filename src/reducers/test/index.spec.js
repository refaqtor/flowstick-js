/* eslint-env mocha */
import expect from 'unexpected';

import reducers from '../../reducers';

describe('Reducers Construction', () => {

  it('should construct with the desired state properties.', () => {
    expect(reducers, 'to be a function');
    expect(reducers(undefined, {}), 'to exhaustively satisfy', {
      routing: expect.it('to be defined'),
      package: expect.it('to be defined'),
    });
  });

});
