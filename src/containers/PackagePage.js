import React, { PropTypes, Component } from 'react';

import Package from '../components/Package';

export default class PackagePage extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  }

  render() {
    const { params } = this.props;
    const { packageFilename, workflowId } = params || {};
    if (!packageFilename) {
      return <div>Nothing here</div>;
    }
    return (
      <Package
        currentWorkflowId={workflowId} />
    );
  }
}
