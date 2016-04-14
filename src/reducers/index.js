import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import PackageReducer from './package';

const rootReducer = combineReducers({
  routing,
  package: PackageReducer,
});

export default rootReducer;
