import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './styles/Lane';

export class Lane extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { height, width, y } = this.props;
    return <div className={styles.lane} style={{ top: y, height, width }} />;
  }
}

export class Lanes extends Component {
  static propTypes = {
    lanes: ImmutablePropTypes.list.isRequired,
    width: PropTypes.number.isRequired,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { lanes, width } = this.props;
    return (
      <div>
        {lanes.map(lane =>
          <Lane key={lane.id} height={lane.height} y={lane.y} width={width} />)}
      </div>
    );
  }
}
