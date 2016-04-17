import React, { Component, PropTypes } from 'react';

let DevTools;

if (process.env.NODE_ENV !== 'production') {
  DevTools = require('./DevTools');
}

export default class Flowstick extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
  }

  render() {
    return (
      <div style={{ height: '100vh' }}>
        {this.props.children}
        {DevTools ? <DevTools /> : null}
      </div>
    );
  }
}
