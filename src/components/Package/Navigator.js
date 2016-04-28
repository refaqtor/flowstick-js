import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classnames from 'classnames';

import styles from './styles/Navigator';

export default class WorkflowNavigator extends Component {
  static propTypes = {
    workflows: ImmutablePropTypes.list.isRequired,
    currentWorkflow: ImmutablePropTypes.record,
    className: PropTypes.string,
    style: PropTypes.object,
    onNavClick: PropTypes.func.isRequired,
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

  navClick(workflowId, evt) {
    evt.preventDefault();
    this.props.onNavClick(workflowId);
  }

  render() {
    const { workflows, className, style, currentWorkflow } = this.props;
    return (
      <ul className={classnames(className, styles.list)} style={style}>
        {WorkflowNavigator.WorkflowsHeading}
        {workflows.map(wf => {
          const classes = classnames(styles.item, {
            [styles.itemActive]: currentWorkflow && wf.id === currentWorkflow.id,
          });
          return (
            <li key={wf.id} className={classes}>
              <a href="#" onClick={this.navClick.bind(this, wf.id)}>
                {WorkflowNavigator.WorkflowIcon}
                {wf.name}
              </a>
            </li>
          );
        })}
      </ul>
    );
  }
}
