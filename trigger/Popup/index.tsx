/** @jsx  React.h */
/** @jsxFrag  React.Fragment */

import * as React from '../../deps.ts';
import { useState, useEffect } from '../../deps.ts';
import type { CSSMotionProps } from '../../motion/index.tsx';
import isMobile from '../../util/isMobile.ts';
import type {
  StretchType,
  AlignType,
  TransitionNameType,
  AnimationType,
  Point,
  MobileConfig,
} from '../interface.ts';
import Mask from './Mask.tsx';
import type { PopupInnerRef } from './PopupInner.tsx';
import PopupInner from './PopupInner.tsx';
import MobilePopupInner from './MobilePopupInner.tsx';

export interface PopupProps {
  visible?: boolean;
  style?: React.JSX.CSSProperties;
  getClassNameFromAlign?: (align: AlignType) => string;
  onAlign?: (element: HTMLElement, align: AlignType) => void;
  getRootDomNode?: () => HTMLElement;
  align?: AlignType;
  destroyPopupOnHide?: boolean;
  className?: string;
  prefixCls: string;
  onMouseEnter?: React.JSX.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.JSX.MouseEventHandler<HTMLElement>;
  onMouseDown?: React.JSX.MouseEventHandler<HTMLElement>;
  onTouchStart?: React.JSX.TouchEventHandler<HTMLElement>;
  stretch?: StretchType;
  children?: React.ComponentChildren;
  point?: Point;
  zIndex?: number;
  mask?: boolean;

  // Motion
  motion: CSSMotionProps;
  maskMotion: CSSMotionProps;
  forceRender?: boolean;

  // Legacy
  animation: AnimationType;
  transitionName: TransitionNameType;
  maskAnimation: AnimationType;
  maskTransitionName: TransitionNameType;

  // Mobile
  mobile?: MobileConfig;
}

const Popup = React.Compat.forwardRef<PopupInnerRef, PopupProps>(
  ({ visible, mobile, ...props }, ref) => {
    const [innerVisible, serInnerVisible] = useState(visible);
    const [inMobile, setInMobile] = useState(false);
    const cloneProps = { ...props, visible: innerVisible };

    // We check mobile in visible changed here.
    // And this also delay set `innerVisible` to avoid popup component render flash
    useEffect(() => {
      serInnerVisible(visible);
      if (visible && mobile) {
        setInMobile(isMobile());
      }
    }, [visible, mobile]);

    const popupNode: React.VNode = inMobile ? (
      <MobilePopupInner {...cloneProps} mobile={mobile} ref={ref} />
    ) : (
      <PopupInner {...cloneProps} ref={ref} />
    );

    // We can use fragment directly but this may failed some selector usage. Keep as origin logic
    return (
      <div>
        <Mask {...cloneProps} />
        {popupNode}
      </div>
    );
  },
);

Popup.displayName = 'Popup';

export default Popup;
