/** @jsx  React.h */
/** @jsxFrag  React.Fragment */

import * as React from '../deps.ts';
import ResizeObserver from '../resize-observer/index.tsx';

interface FillerProps {
  prefixCls?: string;
  /** Virtual filler height. Should be `count * itemMinHeight` */
  height: number;
  /** Set offset of visible items. Should be the top of start item position */
  offset?: number;

  children: React.VNode|React.Compat.JSX.Element[];

  onInnerResize?: () => void;
}

/**
 * Fill component to provided the scroll content real height.
 */
const Filler = React.Compat.forwardRef<HTMLDivElement,FillerProps>(
  (
    { height, offset, children, prefixCls, onInnerResize },
    ref,
  ) => {
    let outerStyle: React.JSX.CSSProperties = {};

    let innerStyle: React.JSX.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
    };

    if (offset !== undefined) {
      outerStyle = { height, position: 'relative', overflow: 'hidden' };

      innerStyle = {
        ...innerStyle,
        transform: `translateY(${offset}px)`,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
      };
    }
    
    return (
      <div style={outerStyle}>
        <ResizeObserver
          onResize={({ offsetHeight }) => {
            if (offsetHeight && onInnerResize) {
              onInnerResize();
            }
          }}
        >
          <div
            style={innerStyle}
            className={prefixCls?`${prefixCls}-holder-inner`:''}
            ref={ref}
          >
            {children}
          </div>
        </ResizeObserver>
      </div>
    );
  },
);

Filler.displayName = 'Filler';

export default Filler;
