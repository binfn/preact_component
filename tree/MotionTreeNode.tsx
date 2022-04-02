import * as React from '../deps.ts';
import { useEffect } from '../deps.ts';
import CSSMotion from '../motion/index.tsx';
import TreeNode, { TreeNodeProps } from './TreeNode.tsx';
import { FlattenNode } from './interface.tsx';
import { getTreeNodeProps, TreeNodeRequiredProps } from './utils/treeUtil.ts';
import { TreeContext } from './contextTypes.ts';

interface MotionTreeNodeProps extends Omit<TreeNodeProps, 'domRef'> {
  active: boolean;
  motion?: any;
  motionNodes?: FlattenNode[];
  onMotionStart: () => void;
  onMotionEnd: () => void;
  motionType?: 'show' | 'hide';

  treeNodeRequiredProps: TreeNodeRequiredProps;
}

//const MotionTreeNode: React.ForwardRefRenderFunction<HTMLDivElement, MotionTreeNodeProps> = (
const MotionTreeNode: React.Compat.ForwardFn<MotionTreeNodeProps,HTMLDivElement> = (
  {
    className,
    style,
    motion,
    motionNodes,
    motionType,
    onMotionStart: onOriginMotionStart,
    onMotionEnd: onOriginMotionEnd,
    active,
    treeNodeRequiredProps,
    ...props
  },
  ref,
) => {
  const [visible, setVisible] = React.useState(true);
  //@ts-ignore original
  const { prefixCls } = React.useContext(TreeContext);

  const motionedRef = React.useRef(false);

  const onMotionEnd = () => {
    if (!motionedRef.current) {
      onOriginMotionEnd();
    }
    motionedRef.current = true;
  };

  useEffect(() => {
    if (motionNodes && motionType === 'hide' && visible) {
      setVisible(false);
    }
  }, [motionNodes]);

  useEffect(() => {
    // Trigger motion only when patched
    if (motionNodes) {
      onOriginMotionStart();
    }

    return () => {
      if (motionNodes) {
        onMotionEnd();
      }
    };
  }, []);

  if (motionNodes) {
    return (
      <CSSMotion
        ref={ref}
        visible={visible}
        {...motion}
        motionAppear={motionType === 'show'}
        onAppearEnd={onMotionEnd}
        onLeaveEnd={onMotionEnd}
      >
        
        
        {( //@ts-ignore original
          {className: motionClassName, style: motionStyle}, motionRef) => (
          <div
            ref={motionRef}
            className={`${prefixCls}-treenode-motion `+motionClassName?motionClassName:''}
            style={motionStyle}
          >
            {motionNodes.map((treeNode: FlattenNode) => {
              const {
                data: { ...restProps },
                title,
                key,
                isStart,
                isEnd,
              } = treeNode;
              delete restProps.children;

              const treeNodeProps = getTreeNodeProps(key, treeNodeRequiredProps);

              return (
                //@ts-ignore original
                <TreeNode
                  {...restProps}
                  {...treeNodeProps}
                  title={title}
                  active={active}
                  data={treeNode.data}
                  key={key}
                  isStart={isStart}
                  isEnd={isEnd}
                />
              );
            })}
          </div>
        )}
      </CSSMotion>
    );
  }
  return <TreeNode domRef={ref} className={className} style={style} {...props} active={active} />;
};

MotionTreeNode.displayName = 'MotionTreeNode';

const RefMotionTreeNode = React.Compat.forwardRef(MotionTreeNode);

export default RefMotionTreeNode;
