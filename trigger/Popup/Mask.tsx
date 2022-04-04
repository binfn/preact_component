/** @jsx  React.h */
/** @jsxFrag  React.Fragment */

import * as React from '../../deps.ts';
import type { CSSMotionProps } from '../../motion/index.tsx';
import CSSMotion from '../../motion/index.tsx';
import type { TransitionNameType, AnimationType } from '../interface.ts';
import { getMotion } from '../utils/legacyUtil.ts';

export interface MaskProps {
  prefixCls: string;
  visible?: boolean;
  zIndex?: number;
  mask?: boolean;

  // Motion
  maskMotion?: CSSMotionProps;

  // Legacy Motion
  maskAnimation?: AnimationType;
  maskTransitionName?: TransitionNameType;
}

export default function Mask(props: MaskProps) {
  const {
    prefixCls,
    visible,
    zIndex,

    mask,
    maskMotion,
    maskAnimation,
    maskTransitionName,
  } = props;

  if (!mask) {
    return null;
  }

  let motion: CSSMotionProps = {};

  if (maskMotion || maskTransitionName || maskAnimation) {
    motion = {
      motionAppear: true,
      ...getMotion({
        motion: maskMotion!,
        prefixCls,
        transitionName: maskTransitionName!,
        animation: maskAnimation!,
      }),
    };
  }

  return (
    <CSSMotion {...motion} visible={visible} removeOnLeave>
      {({ className }:any) => (
        <div
          style={{ zIndex }}
          className={`${prefixCls}-mask ${className?className:''}`}
        />
      )}
    </CSSMotion>
  );
}
