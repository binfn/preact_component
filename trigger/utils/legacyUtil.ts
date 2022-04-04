import type { CSSMotionProps } from '../../motion/index.tsx';
import type { AnimationType, TransitionNameType } from '../interface.ts';

interface GetMotionProps {
  motion: CSSMotionProps;
  animation: AnimationType;
  transitionName: TransitionNameType;
  prefixCls: string;
}

export function getMotion({
  prefixCls,
  motion,
  animation,
  transitionName,
}: GetMotionProps): CSSMotionProps|null {
  if (motion) {
    return motion;
  }

  if (animation) {
    return {
      motionName: `${prefixCls}-${animation}`,
    };
  }

  if (transitionName) {
    return {
      motionName: transitionName,
    };
  }

  return null;
}
