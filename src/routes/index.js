import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Flowstick from '../containers/Flowstick';
import PackagePage from '../containers/PackagePage';

export default (
  <Route path="/" component={Flowstick}>
    <IndexRoute component={PackagePage} />
  </Route>
);
