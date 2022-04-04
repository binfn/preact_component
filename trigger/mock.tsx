/** @jsx  React.h */
/** @jsxFrag  React.Fragment */

import * as React from '../deps.ts';
import { generateTrigger } from './index.tsx';

interface MockPortalProps {
  didUpdate: () => void;
  children: React.VNode;
  getContainer: () => HTMLElement;
}

const MockPortal: React.FunctionComponent<MockPortalProps> = ({
  didUpdate,
  children,
  getContainer,
}) => {
  React.useEffect(() => {
    didUpdate();
    getContainer();
  });

  return children;
};

export default generateTrigger(MockPortal);
