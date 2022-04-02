/** @jsx  React.h */
/** @jsxFrag  React.Fragment */

import * as React from '../deps.ts';
import toArray from '../util/Children/toArray.ts';
import SingleObserver from './SingleObserver/index.tsx';
import { Collection } from './Collection.tsx';

const INTERNAL_PREFIX_KEY = 'rc-observer-key';

export interface SizeInfo {
  width: number;
  height: number;
  offsetWidth: number;
  offsetHeight: number;
}

export type OnResize = (size: SizeInfo, element: HTMLElement) => void;

export interface ResizeObserverProps {
  /** Pass to ResizeObserver.Collection with additional data */
  data?: any;
  children: React.ComponentChildren | ((ref: React.RefObject<any>) => React.VNode);
  disabled?: boolean;
  /** Trigger if element resized. Will always trigger when first time render. */
  onResize?: OnResize;
}

function ResizeObserver(props: ResizeObserverProps) {
  const { children } = props;
  const childNodes = typeof children === 'function' ? [children] : toArray(children);

  return childNodes.map((child, index) => {
    // @ts-ignore original
    const key = child?.key || `${INTERNAL_PREFIX_KEY}-${index}`;
    return (
      <SingleObserver {...props} key={key}>
        {child}
      </SingleObserver>
    );
  }) as any as React.VNode;
}

ResizeObserver.Collection = Collection;

export default ResizeObserver;
