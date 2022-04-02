import * as React from '../../deps.ts';

export interface DomWrapperProps {
  children: React.ComponentChildren;
}

/**
 * Fallback to findDOMNode if origin ref do not provide any dom element
 */
export default class DomWrapper extends React.Component<DomWrapperProps> {
  render() {
    return this.props.children;
  }
}
