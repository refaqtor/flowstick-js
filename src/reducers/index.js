import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import PackageReducer from './package';
import fileDialog from './filedialog';

const rootReducer = combineReducers({
  routing,
  fileDialog,
  package: PackageReducer,
});

export default rootReducer;
