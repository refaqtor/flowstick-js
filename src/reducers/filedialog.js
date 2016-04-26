import { Record } from 'immutable';

import * as FiledialogActions from '../actions/filedialog';

export const FileDialog = Record({
  open: false,
});

const initialState = FileDialog();

export default function filedialog(state = initialState, action) {
  switch (action.type) {

  case FiledialogActions.CLOSE_FILE_DIALOG:
    return state.set('open', false);

  case FiledialogActions.OPEN_FILE_DIALOG:
    return state.set('open', true);

  default:
    return state;

  }
}
