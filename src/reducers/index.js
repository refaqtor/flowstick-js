import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import process from './process';

const rootReducer = combineReducers({
  routing,
  process,
});

export default rootReducer;
