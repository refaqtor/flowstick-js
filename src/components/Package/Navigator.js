import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classnames from 'classnames';

import styles from './styles/Navigator';

class WorkflowLink extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
  }

  static WorkflowIcon =
    <i className="material-icons">timeline</i>


  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  handleClick = evt => {
    evt.preventDefault();
    const { onClick, id } = this.props;
    onClick(id);
  }

  render() {
    const { name, isActive, id } = this.props;
    const activeClass = { [styles.itemActive]: isActive };
    return (
      <li key={id} className={classnames(styles.item, activeClass)}>
        <a href="#" onClick={this.handleClick}>
          {WorkflowLink.WorkflowIcon}
          {name}
        </a>
      </li>
    );
  }
}

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

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  navClick = workflowId => {
    this.props.onNavClick(workflowId);
  }

  render() {
    const { workflows, className, style, currentWorkflow } = this.props;
    return (
      <ul className={classnames(className, styles.list)} style={style}>
        {WorkflowNavigator.WorkflowsHeading}
        {workflows.map(wf =>
          <WorkflowLink key={wf.id} id={wf.id}
            name={wf.name}
            isActive={Boolean(currentWorkflow && currentWorkflow.id === wf.id)}
            onClick={this.navClick} />)}
      </ul>
    );
  }
}
