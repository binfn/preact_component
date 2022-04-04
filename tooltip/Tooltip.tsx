/** @jsx  React.h */
/** @jsxFrag  React.Fragment */

import * as React from '../deps.ts';
import { useRef, useImperativeHandle } from '../deps.ts';
import Trigger from '../trigger/index.tsx';
import type { TriggerProps } from '../trigger/index.tsx';
import type { AlignType, AnimationType, ActionType } from '../trigger/interface.ts';
import { placements } from './placements.tsx';
import Content from './Content.tsx';

export interface TooltipProps extends Pick<TriggerProps, 'onPopupAlign' | 'builtinPlacements'> {
  trigger?: ActionType | ActionType[];
  defaultVisible?: boolean;
  visible?: boolean;
  placement?: string;
  /** @deprecated Use `motion` instead */
  transitionName?: string;
  /** @deprecated Use `motion` instead */
  animation?: AnimationType;
  /** Config popup motion */
  motion?: TriggerProps['popupMotion'];
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  overlay: (() => React.ComponentChild) | React.ComponentChild;
  overlayStyle?: React.JSX.CSSProperties;
  overlayClassName?: string;
  prefixCls?: string;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  getTooltipContainer?: (node: HTMLElement) => HTMLElement;
  destroyTooltipOnHide?:
    | boolean
    | {
        keepParent?: boolean;
      };
  align?: AlignType;
  showArrow?: boolean;
  arrowContent?: React.ComponentChild;
  id?: string;
  children: React.VNode;
  popupVisible?: boolean;
  overlayInnerStyle?: React.JSX.CSSProperties;
  zIndex?: number;
}

const Tooltip = (props: TooltipProps, ref:React.Ref<any>) => {
  const {
    overlayClassName,
    trigger = ['hover'],
    mouseEnterDelay = 0,
    mouseLeaveDelay = 0.1,
    overlayStyle,
    prefixCls = 'rc-tooltip',
    children,
    onVisibleChange,
    afterVisibleChange,
    transitionName,
    animation,
    motion,
    placement = 'right',
    align = {},
    destroyTooltipOnHide = false,
    defaultVisible,
    getTooltipContainer,
    overlayInnerStyle,
    ...restProps
  } = props;

  const domRef = useRef(null);
  useImperativeHandle(ref, () => domRef.current);

  const extraProps = { ...restProps };
  if ('visible' in props) {
    extraProps.popupVisible = props.visible;
  }

  const getPopupElement = () => {
    const { showArrow = true, arrowContent = null, overlay, id } = props;
    return [
      showArrow && (
        <div className={`${prefixCls}-arrow`} key="arrow">
          {arrowContent}
        </div>
      ),
      <Content
        key="content"
        prefixCls={prefixCls}
        id={id!}
        overlay={overlay}
        overlayInnerStyle={overlayInnerStyle}
      />,
    ];
  };

  let destroyTooltip = false;
  let autoDestroy = false;
  if (typeof destroyTooltipOnHide === 'boolean') {
    destroyTooltip = destroyTooltipOnHide;
  } else if (destroyTooltipOnHide && typeof destroyTooltipOnHide === 'object') {
    const { keepParent } = destroyTooltipOnHide;
    destroyTooltip = keepParent === true;
    autoDestroy = keepParent === false;
  }

  return (
    <Trigger
      popupClassName={overlayClassName}
      prefixCls={prefixCls}
      popup={getPopupElement}
      action={trigger}
      builtinPlacements={placements}
      popupPlacement={placement}
      ref={domRef}
      popupAlign={align}
      getPopupContainer={getTooltipContainer}
      onPopupVisibleChange={onVisibleChange}
      afterPopupVisibleChange={afterVisibleChange}
      popupTransitionName={transitionName}
      popupAnimation={animation}
      popupMotion={motion}
      defaultPopupVisible={defaultVisible}
      destroyPopupOnHide={destroyTooltip}
      autoDestroy={autoDestroy}
      mouseLeaveDelay={mouseLeaveDelay}
      popupStyle={overlayStyle}
      mouseEnterDelay={mouseEnterDelay}
      {...extraProps}
    >
      {children}
    </Trigger>
  );
};

export default React.Compat.forwardRef(Tooltip);
