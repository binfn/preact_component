/** @jsx  React.h */
/** @jsxFrag  React.Fragment */

import * as React from '../../deps.ts';
import { useRef, useState } from '../../deps.ts';
import Align from '../../align/index.ts';
import type { RefAlign } from '../../align/Align.tsx';
import type { CSSMotionProps, MotionEndEventHandler } from '../../motion/index.tsx';
import CSSMotion from '../../motion/index.tsx';

import type {
  Point,
  AlignType,
  StretchType,
  TransitionNameType,
  AnimationType,
} from '../interface.ts';
import useVisibleStatus from './useVisibleStatus.ts';
import { getMotion } from '../utils/legacyUtil.ts';
import useStretchStyle from './useStretchStyle.ts';

export interface PopupInnerProps {
  visible?: boolean;

  prefixCls: string;
  className?: string;
  style?: React.JSX.CSSProperties;
  children?: React.ComponentChildren;
  zIndex?: number;

  // Motion
  motion: CSSMotionProps;
  destroyPopupOnHide?: boolean;
  forceRender?: boolean;

  // Legacy Motion
  animation: AnimationType;
  transitionName: TransitionNameType;

  // Measure
  stretch?: StretchType;

  // Align
  align?: AlignType;
  point?: Point;
  getRootDomNode?: () => HTMLElement;
  getClassNameFromAlign?: (align: AlignType) => string;
  onAlign?: (element: HTMLElement, align: AlignType) => void;

  // Events
  onMouseEnter?: React.JSX.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.JSX.MouseEventHandler<HTMLDivElement>;
  onMouseDown?: React.JSX.MouseEventHandler<HTMLDivElement>;
  onTouchStart?: React.JSX.TouchEventHandler<HTMLDivElement>;
}

export interface PopupInnerRef {
  forceAlign: () => void;
  getElement: () => HTMLElement;
}

const PopupInner = React.Compat.forwardRef<PopupInnerRef, PopupInnerProps>(
  (props, ref) => {
    const {
      visible,

      prefixCls,
      className,
      style,
      children,
      zIndex,

      stretch,
      destroyPopupOnHide,
      forceRender,

      align,
      point,
      getRootDomNode,
      getClassNameFromAlign,
      onAlign,

      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onTouchStart,
    } = props;

    const alignRef = useRef<RefAlign>(null);
    const elementRef = useRef<HTMLDivElement>();

    const [alignedClassName, setAlignedClassName] = useState<string>();

    // ======================= Measure ========================
    const [stretchStyle, measureStretchStyle] = useStretchStyle(stretch);

    function doMeasure() {
      if (stretch) {
        measureStretchStyle(getRootDomNode!());
      }
    }

    // ======================== Status ========================
    const [status, goNextStatus] = useVisibleStatus(visible!, doMeasure);

    // ======================== Aligns ========================
    const prepareResolveRef = useRef<(value?: unknown) => void>();

    // `target` on `rc-align` can accept as a function to get the bind element or a point.
    // ref: https://www.npmjs.com/package/rc-align
    function getAlignTarget() {
      if (point) {
        return point;
      }
      return getRootDomNode;
    }

    function forceAlign() {
      alignRef.current?.forceAlign();
    }

    function onInternalAlign(popupDomNode: HTMLElement, matchAlign: AlignType) {
      const nextAlignedClassName = getClassNameFromAlign!(matchAlign);
      if (alignedClassName !== nextAlignedClassName) {
        setAlignedClassName(nextAlignedClassName);
      }
      if (status === 'align') {
        // Repeat until not more align needed
        if (alignedClassName !== nextAlignedClassName) {
          Promise.resolve().then(() => {
            forceAlign();
          });
        } else {
          goNextStatus(() => {
            prepareResolveRef.current?.();
          });
        }

        onAlign?.(popupDomNode, matchAlign);
      }
    }

    // ======================== Motion ========================
    const motion = { ...getMotion(props) };
    ['onAppearEnd', 'onEnterEnd', 'onLeaveEnd'].forEach((eventName) => {
      //@ts-ignore original
      const originHandler: MotionEndEventHandler = motion[eventName];
      //@ts-ignore original
      motion[eventName] = (element:any, event:any) => {
        goNextStatus();
        return originHandler?.(element, event);
      };
    });

    function onShowPrepare() {
      return new Promise((resolve) => {
        prepareResolveRef.current = resolve;
      });
    }

    // Go to stable directly when motion not provided
    React.useEffect(() => {
      if (!motion.motionName && status === 'motion') {
        goNextStatus();
      }
    }, [motion.motionName, status]);

    // ========================= Refs =========================
    React.useImperativeHandle(ref, () => ({
      forceAlign,
      getElement: () => elementRef.current!,
    }));

    // ======================== Render ========================
    const mergedStyle: React.JSX.CSSProperties = {
      ...stretchStyle,
      zIndex,
      opacity:
        status === 'motion' || status === 'stable' || !visible ? undefined : 0,
      pointerEvents: status === 'stable' ? undefined : 'none',
      ...style,
    };

    // Align status
    let alignDisabled = true;
    if (align?.points && (status === 'align' || status === 'stable')) {
      alignDisabled = false;
    }

    let childNode = children;

    // Wrapper when multiple children
    if (React.Compat.Children.count(children) > 1) {
      childNode = <div className={`${prefixCls}-content`}>{children}</div>;
    }

    return (
      <CSSMotion
        visible={visible}
        ref={elementRef}
        leavedClassName={`${prefixCls}-hidden`}
        {...motion}
        onAppearPrepare={onShowPrepare}
        onEnterPrepare={onShowPrepare}
        removeOnLeave={destroyPopupOnHide}
        forceRender={forceRender}
      >
        {({ className: motionClassName, style: motionStyle }:any, motionRef:any) => {
          const mergedClassName = `${prefixCls?prefixCls:''} ${className?className:''} ${alignedClassName?alignedClassName:''} ${motionClassName?motionClassName:''}`;
          // const mergedClassName = classNames(
          //   prefixCls,
          //   className,
          //   alignedClassName,
          //   motionClassName,
          // );

          return (
            <Align
             // @ts-ignore original
              target={getAlignTarget()}
              key="popup"
              ref={alignRef}
              monitorWindowResize
              disabled={alignDisabled}
              align={align!}
              onAlign={onInternalAlign}
            >
              <div
                ref={motionRef}
                className={mergedClassName}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onMouseDownCapture={onMouseDown}
                onTouchStartCapture={onTouchStart}
                style={{
                  ...motionStyle,
                  ...mergedStyle,
                }}
              >
                {childNode}
              </div>
            </Align>
          );
        }}
      </CSSMotion>
    );
  },
);

PopupInner.displayName = 'PopupInner';

export default PopupInner;
