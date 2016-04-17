import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Link } from 'react-router';

import PureComponent from '../PureComponent';

const EQFN = 'create_equity_financing.xpdl';

export default class WorkflowNavigator extends PureComponent {
  static propTypes = {
    workflows: ImmutablePropTypes.list.isRequired,
  }

  render() {
    const { workflows, className } = this.props;
    return (
      <ul className={className}>
        {workflows.map(wf =>
          <li key={wf.id}>
            <Link to={`/packages/${EQFN}/workflows/${wf.id}/`}>
              {wf.name}
            </Link>
          </li>)}
      </ul>
    );
  }
}
