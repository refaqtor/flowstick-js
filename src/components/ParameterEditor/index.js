import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/python/python';

export default class ParameterEditor extends Component {
  static propTypes = {
    param: ImmutablePropTypes.record.isRequired,
    onChange: PropTypes.func.isRequired,
  }
  static editorOptions = {
    mode: 'python',
    theme: 'material',
    lineSeparator: '\n',
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  onChange = newValue => {
    const { param, onChange } = this.props;
    onChange(param.id, newValue);
  }

  render() {
    const { param } = this.props;
    return (
      <section>
        <h4>{param.title}</h4>
        <CodeMirror value={param.value} onChange={this.onChange}
          options={ParameterEditor.editorOptions} />
      </section>
    );
  }
}
