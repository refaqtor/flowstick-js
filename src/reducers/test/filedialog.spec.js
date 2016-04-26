/* eslint-env mocha */
import expect from 'unexpected';

import FileDialogReducer, { FileDialog } from '../filedialog';
import * as FiledialogActions from '../../actions/filedialog';

describe('FileDialog Reducer', () => {

  it('should init as closed.', () => {
    expect(FileDialogReducer(undefined, {}).open, 'to be falsy');
  });

  it('should set opened state.', () => {
    const initState = FileDialog({ open: false });
    const first = FileDialogReducer(initState, {
      type: FiledialogActions.OPEN_FILE_DIALOG,
    });
    expect(first.open, 'to be truthy');

    const second = FileDialogReducer(first, {
      type: FiledialogActions.OPEN_FILE_DIALOG,
    });
    expect(second.open, 'to be truthy');
  });

  it('should set closed state.', () => {
    const initState = FileDialog({ open: true });
    const first = FileDialogReducer(initState, {
      type: FiledialogActions.CLOSE_FILE_DIALOG,
    });
    expect(first.open, 'to be falsy');

    const second = FileDialogReducer(first, {
      type: FiledialogActions.CLOSE_FILE_DIALOG,
    });
    expect(second.open, 'to be falsy');
  });

});
