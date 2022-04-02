/// <reference lib="dom" />
/**
 * Webpack has bug for import loop, which is not the same behavior as ES module.
 * When util.js imports the TreeNode for tree generate will cause treeContextTypes be empty.
 */
import * as React from '../deps.ts';
import {
  IconType,
  Key,
  DataEntity,
  EventDataNode,
  NodeInstance,
  DataNode,
  Direction,
  BasicDataNode,
} from './interface.tsx';
import { DraggableConfig } from './Tree.tsx';

export type NodeMouseEventParams<T = HTMLSpanElement> = {
  event: MouseEvent;
  node: EventDataNode;
};
export type NodeDragEventParams<T = HTMLDivElement> = {
  event: DragEvent;
  node: EventDataNode;
};

export type NodeMouseEventHandler<T = HTMLSpanElement> = (
  e: MouseEvent,
  node: EventDataNode,
) => void;
export type NodeDragEventHandler<
  T = HTMLDivElement,
  TreeDataType extends BasicDataNode = DataNode,
> = (e: DragEvent, node: NodeInstance<TreeDataType>, outsideTree?: boolean) => void;

export interface TreeContextProps {
  prefixCls: string;
  selectable: boolean;
  showIcon: boolean;
  icon: IconType;
  switcherIcon: IconType;
  draggable?: DraggableConfig;
  draggingNodeKey?: React.Key;
  checkable: boolean | React.VNode;
  checkStrictly: boolean;
  disabled: boolean;
  keyEntities: Record<Key, DataEntity<any>>;
  // for details see comment in Tree.state (Tree.tsx)
  dropLevelOffset?: number;
  dropContainerKey: Key | null;
  dropTargetKey: Key | null;
  dropPosition: -1 | 0 | 1 | null;
  indent: number | null;
  dropIndicatorRender: (props: {
    dropPosition: -1 | 0 | 1;
    dropLevelOffset: number;
    indent:any;
    prefixCls:any;
    direction: Direction;
  }) => React.VNode;
  dragOverNodeKey: Key | null;
  direction: Direction;

  loadData: (treeNode: EventDataNode) => Promise<void>;
  filterTreeNode: (treeNode: EventDataNode) => boolean;
  titleRender?: (node: any) => React.VNode;

  onNodeClick: NodeMouseEventHandler;
  onNodeDoubleClick: NodeMouseEventHandler;
  onNodeExpand: NodeMouseEventHandler;
  onNodeSelect: NodeMouseEventHandler;
  onNodeCheck: (
    e: MouseEvent,
    treeNode: EventDataNode,
    checked: boolean,
  ) => void;
  onNodeLoad: (treeNode: EventDataNode) => void;
  onNodeMouseEnter: NodeMouseEventHandler;
  onNodeMouseLeave: NodeMouseEventHandler;
  onNodeContextMenu: NodeMouseEventHandler;
  onNodeDragStart: NodeDragEventHandler<any, any>;
  onNodeDragEnter: NodeDragEventHandler<any, any>;
  onNodeDragOver: NodeDragEventHandler<any, any>;
  onNodeDragLeave: NodeDragEventHandler<any, any>;
  onNodeDragEnd: NodeDragEventHandler<any, any>;
  onNodeDrop: NodeDragEventHandler<any, any>;
}

export const TreeContext: React.Context<TreeContextProps | null> = React.createContext<TreeContextProps | null>(null);
