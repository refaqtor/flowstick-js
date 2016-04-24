import React, { Component } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classnames from 'classnames';

import styles from './styles/ToolBar';

export default class ToolBar extends Component {
  static propTypes = {
    buttons: ImmutablePropTypes.list.isRequired,
  }

  static listClassNames = classnames(styles.toolbar, 'columns', 'unselectable')

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  onClick(index, evt) {
    const button = this.props.buttons.get(index);
    if (!button || button.disabled || !button.onClick) {
      return;
    }
    button.onClick(evt);
  }

  render() {
    const { buttons } = this.props;
    return (
      <ul className={ToolBar.listClassNames}>
        {buttons.map((button, index) =>
          <li key={index}
            className={classnames('material-icons', {
              [styles.buttonDisabled]: button.disabled,
            })}
            onClick={this.onClick.bind(this, index)}>
            {button.icon}
          </li>)}
      </ul>
    );
  }
}
