/* eslint-disable react/default-props-match-prop-types, react/no-multi-comp, react/prop-types */
import * as React from '../deps.ts';
import { useRef } from '../deps.ts';
import findDOMNode from '../util/Dom/findDOMNode.ts';
import { fillRef } from '../util/ref.ts';
import { getTransitionName, supportTransition } from './util/motion.ts';
import type {
  MotionStatus,
  MotionEventHandler,
  MotionEndEventHandler,
  MotionPrepareEventHandler,
} from './interface.ts';
import { STATUS_NONE, STEP_PREPARE, STEP_START } from './interface.ts';
import useStatus from './hooks/useStatus.ts';
import DomWrapper from './DomWrapper.tsx';
import { isActive } from './hooks/useStepQueue.ts';

export type CSSMotionConfig =
  | boolean
  | {
      transitionSupport?: boolean;
      /** @deprecated, no need this anymore since `rc-motion` only support latest react */
      forwardRef?: boolean;
    };

export type MotionName =
  | string
  | {
      appear?: string;
      enter?: string;
      leave?: string;
      appearActive?: string;
      enterActive?: string;
      leaveActive?: string;
    };

export interface CSSMotionProps {
  motionName?: MotionName;
  visible?: boolean;
  motionAppear?: boolean;
  motionEnter?: boolean;
  motionLeave?: boolean;
  motionLeaveImmediately?: boolean;
  motionDeadline?: number;
  /**
   * Create element in view even the element is invisible.
   * Will patch `display: none` style on it.
   */
  forceRender?: boolean;
  /**
   * Remove element when motion end. This will not work when `forceRender` is set.
   */
  removeOnLeave?: boolean;
  leavedClassName?: string;
  /** @private Used by CSSMotionList. Do not use in your production. */
  eventProps?: object;

  // Prepare groups
  onAppearPrepare?: MotionPrepareEventHandler;
  onEnterPrepare?: MotionPrepareEventHandler;
  onLeavePrepare?: MotionPrepareEventHandler;

  // Normal motion groups
  onAppearStart?: MotionEventHandler;
  onEnterStart?: MotionEventHandler;
  onLeaveStart?: MotionEventHandler;

  onAppearActive?: MotionEventHandler;
  onEnterActive?: MotionEventHandler;
  onLeaveActive?: MotionEventHandler;

  onAppearEnd?: MotionEndEventHandler;
  onEnterEnd?: MotionEndEventHandler;
  onLeaveEnd?: MotionEndEventHandler;

  // Special
  /** This will always trigger after final visible changed. Even if no motion configured. */
  onVisibleChanged?: (visible: boolean) => void;

  internalRef?: React.Ref<any>;

  children?: (
    props: {
      visible?: boolean;
      className?: string;
      style?: React.JSX.CSSProperties;
      [key: string]: any;
    },
    ref: (node: any) => void,
  ) => React.VNode;
}

export interface CSSMotionState {
  status?: MotionStatus;
  statusActive?: boolean;
  newStatus?: boolean;
  statusStyle?: React.JSX.CSSProperties;
  prevProps?: CSSMotionProps;
}

/**
 * `transitionSupport` is used for none transition test case.
 * Default we use browser transition event support check.
 */
export function genCSSMotion(
  config: CSSMotionConfig,
): any{//React.ForwardRefExoticComponent<CSSMotionProps & { ref?: React.Ref<any> }> {
  let transitionSupport:any = config;

  if (typeof config === 'object') {
    //transitionSupport=config.transitionSupport
    ({ transitionSupport } = config);
  }

  function isSupportTransition(props: CSSMotionProps) {
    return !!(props.motionName && transitionSupport);
  }

  const CSSMotion = React.Compat.forwardRef<any, CSSMotionProps>((props, ref) => {
    const {
      // Default config
      visible = true,
      removeOnLeave = true,

      forceRender,
      children,
      motionName,
      leavedClassName,
      eventProps,
    } = props;

    const supportMotion = isSupportTransition(props);

    // Ref to the react node, it may be a HTMLElement
    const nodeRef = useRef<any>();
    // Ref to the dom wrapper in case ref can not pass to HTMLElement
    const wrapperNodeRef = useRef();

    function getDomElement() {
      try {
        // Here we're avoiding call for findDOMNode since it's deprecated
        // in strict mode. We're calling it only when node ref is not
        // an instance of DOM HTMLElement. Otherwise use
        // findDOMNode as a final resort
        return nodeRef.current instanceof HTMLElement
          ? nodeRef.current
          : findDOMNode<HTMLElement>(wrapperNodeRef.current!);
      } catch (e) {
        // Only happen when `motionDeadline` trigger but element removed.
        return null;
      }
    }

    const [status, statusStep, statusStyle, mergedVisible] = useStatus(
      supportMotion,
      visible,
      getDomElement as ()=>HTMLElement,
      props,
    );

    // Record whether content has rendered
    // Will return null for un-rendered even when `removeOnLeave={false}`
    const renderedRef = React.useRef(mergedVisible);
    if (mergedVisible) {
      renderedRef.current = true;
    }

    // ====================== Refs ======================
    const setNodeRef = React.useCallback((node: any) => {
      nodeRef.current = node;
      fillRef(ref, node);
    }, []);

    // ===================== Render =====================
    let motionChildren: React.VNode|null;
    const mergedProps = { ...eventProps, visible };

    if (!children) {
      // No children
      motionChildren = null;
    } else if (status === STATUS_NONE || !isSupportTransition(props)) {
      // Stable children
      if (mergedVisible) {
        motionChildren = children({ ...mergedProps }, setNodeRef);
      } else if (!removeOnLeave && renderedRef.current) {
        motionChildren = children(
          { ...mergedProps, className: leavedClassName },
          setNodeRef,
        );
      } else if (forceRender) {
        motionChildren = children(
          { ...mergedProps, style: { display: 'none' } },
          setNodeRef,
        );
      } else {
        motionChildren = null;
      }
    } else {
      // In motion
      let statusSuffix: string|undefined=undefined;
      if (statusStep === STEP_PREPARE) {
        statusSuffix = 'prepare';
      } else if (isActive(statusStep)) {
        statusSuffix = 'active';
      } else if (statusStep === STEP_START) {
        statusSuffix = 'start';
      }
      const classNames1=getTransitionName(motionName!, status)
      const classNames2=getTransitionName(motionName!, `${status}-${statusSuffix}`)
      motionChildren = children(
        {
          ...mergedProps,
          className: classNames1?classNames1:''
          +' '+statusSuffix?classNames2:''
          +' '+typeof motionName === 'string'?motionName:'',
          
          // classNames(getTransitionName(motionName, status), {
          //   [getTransitionName(motionName, `${status}-${statusSuffix}`)]:
          //     statusSuffix,
          //   [motionName as string]: typeof motionName === 'string',
          // }),
          style: statusStyle,
        },
        setNodeRef,
      );
    }

    return <DomWrapper ref={wrapperNodeRef}>{motionChildren}</DomWrapper>;
  });

  CSSMotion.displayName = 'CSSMotion';

  return CSSMotion;
}

export default genCSSMotion(supportTransition);
