import React, { Component, PropTypes } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { Transitions } from './Transition';
import { Lanes } from './Lane';
import { Activities } from './Activity';

export default class Workflow extends Component {
  static propTypes = {
    dragActivity: PropTypes.func.isRequired,
    stopDragActivity: PropTypes.func.isRequired,
    lanesWidth: PropTypes.number.isRequired,
    transitions: ImmutablePropTypes.map.isRequired,
    activities: ImmutablePropTypes.list.isRequired,
    lanes: ImmutablePropTypes.list.isRequired,
    focusObject: PropTypes.func.isRequired,
    unfocusAllObjects: PropTypes.func.isRequired,
    className: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { lanes, lanesWidth, activities, transitions,
            dragActivity, stopDragActivity, focusObject, className,
            unfocusAllObjects } = this.props;
    return (
      <Scrollbars className={className} style={{ height: 'auto' }}
        invertWheelDirection
        onClick={unfocusAllObjects}>
        <Lanes lanes={lanes} width={lanesWidth} />
        <Activities activities={activities}
          focusActivity={focusObject.bind(undefined, 'activity')}
          dragActivity={dragActivity}
          stopDragActivity={stopDragActivity} />
        <Transitions transitions={transitions}
          focusTransition={focusObject.bind(undefined, 'transition')} />
      </Scrollbars>
    );
  }
}
