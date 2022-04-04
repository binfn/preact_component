/** @jsx  React.h */
/** @jsxFrag  React.Fragment */

import * as React from '../../deps.ts';
import CSSMotion from '../../motion/index.tsx';
import type { PopupInnerProps, PopupInnerRef } from './PopupInner.tsx';
import type { MobileConfig } from '../interface.ts';

interface MobilePopupInnerProps extends PopupInnerProps {
  mobile?: MobileConfig;
}

const MobilePopupInner = React.Compat.forwardRef<PopupInnerRef, MobilePopupInnerProps>(
  (props, ref) => {
    const {
      prefixCls,
      visible,
      zIndex,
      children,
      mobile: {
        popupClassName,
        popupStyle,
        popupMotion = {},
        popupRender,
      } = {},
    } = props;
    const elementRef = React.useRef<HTMLDivElement>();

    // ========================= Refs =========================
    React.useImperativeHandle(ref, () => ({
      forceAlign: () => {},
      getElement: () => elementRef.current!,
    }));

    // ======================== Render ========================
    const mergedStyle: React.JSX.CSSProperties = {
      zIndex,

      ...popupStyle,
    };

    let childNode = children;

    // Wrapper when multiple children
    if (React.Compat.Children.count(children) > 1) {
      childNode = <div className={`${prefixCls}-content`}>{children}</div>;
    }

    // Mobile support additional render
    if (popupRender) {
      childNode = popupRender(childNode!);
    }

    return (
      <CSSMotion
        visible={visible}
        ref={elementRef}
        removeOnLeave
        {...popupMotion}
      >
        {({ className: motionClassName, style: motionStyle }:any, motionRef:any) => {
          const mergedClassName = `${prefixCls?prefixCls:''} ${popupClassName?popupClassName:''} ${motionClassName?motionClassName:''}`;
          // const mergedClassName = classNames(
          //   prefixCls,
          //   popupClassName,
          //   motionClassName,
          // );

          return (
            <div
              ref={motionRef}
              className={mergedClassName}
              style={{
                ...motionStyle,
                ...mergedStyle,
              }}
            >
              {childNode}
            </div>
          );
        }}
      </CSSMotion>
    );
  },
);

MobilePopupInner.displayName = 'MobilePopupInner';

export default MobilePopupInner;
