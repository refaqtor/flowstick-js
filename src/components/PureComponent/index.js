import { Component } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default class PureComponent extends Component {

  constructor(props) {
    super(props);
    this.shouldComponentUpdate =
      PureRenderMixin.shouldComponentUpdate.bind(this);
  }

}
