import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Link } from 'react-router';
import classnames from 'classnames';

import PureComponent from '../PureComponent';
import styles from './styles/Navigator';

const EQFN = 'create_equity_financing.xpdl';

export default class WorkflowNavigator extends PureComponent {
  static propTypes = {
    workflows: ImmutablePropTypes.list.isRequired,
    currentWorkflow: ImmutablePropTypes.record,
  }
  static WorkflowsHeading =
    <li className={classnames(styles.item, styles.listHeading)}>
      Workflows
    </li>
  static WorkflowIcon =
    <i className="material-icons">timeline</i>

  render() {
    const { workflows, className, currentWorkflow } = this.props;
    const { id } = currentWorkflow || {};
    return (
      <ul className={classnames(className, styles.list)}>
        {WorkflowNavigator.WorkflowsHeading}
        {workflows.map(wf => {
          const classes = classnames(styles.item, {
            [styles.itemActive]: currentWorkflow && wf.id === id,
          });
          return (
            <li key={wf.id} className={classes}>
              <Link to={`/packages/${EQFN}/workflows/${wf.id}/`}>
                {WorkflowNavigator.WorkflowIcon}
                {wf.name}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
}
