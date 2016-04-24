import React, { Component, PropTypes } from 'react';

import { getFilenameFromUserPrompt, escapeFilename } from '../file';
import AppHeader from '../components/AppHeader';

let DevTools = null;

if (process.env.NODE_ENV !== 'production') {
  DevTools = require('./DevTools');
  DevTools = <DevTools />;
}

export default class Flowstick extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
  }

  static styles = {
    height: '100vh',
  }

  openFile() {
    getFilenameFromUserPrompt()
      .then(filename => {
        window.location.hash = `/packages/${escapeFilename(filename)}/`;
      }, () => {});
  }

  render() {
    return (
      <div className="columns vert-columns" style={Flowstick.styles}>
        <AppHeader openFile={this.openFile} />
        <section className="column columns vert-columns">
          {this.props.children}
        </section>
        {DevTools}
      </div>
    );
  }
}
