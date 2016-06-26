import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Tabs, Tab } from 'react-toolbox/lib/tabs';

import ParameterEditor from '../ParameterEditor';

export default class ItemEditor extends Component {
  static propTypes = {
    item: ImmutablePropTypes.list.isRequired,
    onItemChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { params, onParamChange } = this.props;
    return (
      <Tabs index={0}>
        <Tab label="General">
          {params.map(param => <ParameterEditor key={param.id}
                                 param={param} onChange={onParamChange} />)}
        </Tab>
        <Tab label="Extended Attributes">
          Attribute maker...
        </Tab>
      </Tabs>
    );
  }
}
