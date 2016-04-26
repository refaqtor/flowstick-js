import { Component, PropTypes } from 'react';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';

import { getFilenameFromUserPrompt, escapeFilename } from '../../file';

export default class FileDialog extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    open: PropTypes.bool.isRequired,
    closeFileDialog: PropTypes.func.isRequired,
  }

  static noOp = () => {}

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  openDialog() {
    getFilenameFromUserPrompt()
      .then(filename => {
        window.location.hash = `/packages/${escapeFilename(filename)}/`;
      }, FileDialog.noOp)
      .finally(() => {
        this.props.closeFileDialog();
      });
  }

  componentDidMount() {
    if (this.props.open) {
      this.openDialog();
    }
  }

  componentDidUpdate(prevProps) {
    const prevOpen = prevProps.open;
    const curOpen = this.props.open;
    if (curOpen && !prevOpen) {
      this.openDialog();
    }
  }

  render() {
    return this.props.children;
  }
}
