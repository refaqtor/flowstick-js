import React, { PropTypes, Component } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classnames from 'classnames';

import styles from './styles/ToolBar';

class ToolBarButton extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    disabled: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  handleClick = evt => {
    const { index, onClick } = this.props;
    onClick(index, evt);
  }

  render() {
    const { icon, disabled } = this.props;
    const disabledClass = { [styles.buttonDisabled]: disabled };
    return (
      <li className={classnames('material-icons column', disabledClass)}
        onClick={this.handleClick}>
        {icon}
      </li>
    );
  }
}

export default class ToolBar extends Component {
  static propTypes = {
    buttons: ImmutablePropTypes.list.isRequired,
  }

  static listClassNames = classnames(styles.toolbar, 'columns', 'unselectable')

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  handleClick = (index, evt) => {
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
          <ToolBarButton key={index} index={index}
            disabled={button.disabled}
            onClick={this.handleClick}
            icon={button.icon} />
          )}
      </ul>
    );
  }
}
