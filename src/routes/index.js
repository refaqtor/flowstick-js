import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Flowstick from '../containers/Flowstick';
import EmptyFlowstick from '../containers/EmptyFlowstick';
import PackagePage from '../containers/PackagePage';

export default (
  <Route path="/" component={Flowstick}>
    <Route path="packages/:packageFilename/" component={PackagePage}>
      <Route path="workflows/:workflowId/" />
    </Route>
    <IndexRoute component={EmptyFlowstick} />
  </Route>
);
