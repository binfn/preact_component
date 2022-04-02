/** @jsx  React.h */
/** @jsxFrag  React.Fragment */

import * as React from '../deps.ts';

export interface ItemProps {
  children: React.VNode;
  setRef: (element: HTMLElement) => void;
}

export function Item({ children, setRef }: ItemProps) {
  const refFunc = React.useCallback((node:any) => {
    setRef(node);
  }, []);

  return React.cloneElement(children, {
    ref: refFunc,
  });
}
