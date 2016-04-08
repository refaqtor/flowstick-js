import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Flowstick from '../containers/Flowstick';
import HomePage from '../containers/HomePage';

export default (
  <Route path="/" component={Flowstick}>
    <IndexRoute component={HomePage} />
  </Route>
);
