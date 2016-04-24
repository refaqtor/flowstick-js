import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Link } from 'react-router';
import classnames from 'classnames';

import { escapeFilename } from '../../file';
import styles from './styles/Navigator';

export default class WorkflowNavigator extends Component {
  static propTypes = {
    workflows: ImmutablePropTypes.list.isRequired,
    currentWorkflow: ImmutablePropTypes.record,
    filename: PropTypes.string.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
  }

  static WorkflowsHeading =
    <li className={classnames(styles.item, styles.listHeading)}>
      Workflows
    </li>

  static WorkflowIcon =
    <i className="material-icons">timeline</i>

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { filename, workflows, className, style, currentWorkflow } = this.props;
    const { id } = currentWorkflow || {};
    return (
      <ul className={classnames(className, styles.list)} style={style}>
        {WorkflowNavigator.WorkflowsHeading}
        {workflows.map(wf => {
          const classes = classnames(styles.item, {
            [styles.itemActive]: currentWorkflow && wf.id === id,
          });
          return (
            <li key={wf.id} className={classes}>
              <Link to={`/packages/${escapeFilename(filename)}/workflows/${wf.id}/`}>
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
