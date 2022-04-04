/** @jsx  React.h */
/** @jsxFrag  React.Fragment */

import * as React from '../deps.ts';

export interface ContentProps {
  prefixCls?: string;
  overlay: (() => React.ComponentChild) | React.ComponentChild;
  id: string;
  overlayInnerStyle?: React.JSX.CSSProperties;
}

const Content = (props: ContentProps) => {
  const { overlay, prefixCls, id, overlayInnerStyle } = props;

  return (
    <div className={`${prefixCls}-inner`} id={id} role="tooltip" style={overlayInnerStyle}>
      {typeof overlay === 'function' ? overlay() : overlay}
    </div>
  );
};

export default Content;
