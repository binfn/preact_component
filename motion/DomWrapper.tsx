import * as React from '../deps.ts';

export interface DomWrapperProps {
  children: React.ComponentChildren;
}

class DomWrapper extends React.Component<DomWrapperProps> {
  render() {
    return this.props.children;
  }
}

export default DomWrapper;
