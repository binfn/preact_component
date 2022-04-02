import * as React from '../../deps.ts';
import omit from '../../util/omit.ts';
import toArray from '../../util/Children/toArray.ts';

import {
  DataNode,
  FlattenNode,
  NodeElement,
  DataEntity,
  Key,
  EventDataNode,
  GetKey,
  FieldNames,
  BasicDataNode,
} from '../interface.tsx';
import { getPosition, isTreeNode } from '../util.tsx';
import { TreeNodeProps } from '../TreeNode.tsx';

export function getKey(key: Key, pos: string) {
  if (key !== null && key !== undefined) {
    return key;
  }
  return pos;
}

export function fillFieldNames(fieldNames?: FieldNames): Required<FieldNames> {
  const { title, _title, key, children } = fieldNames || {};
  const mergedTitle = title || 'title';

  return {
    title: mergedTitle,
    _title: _title || [mergedTitle],
    key: key || 'key',
    children: children || 'children',
  };
}

/**
 * Warning if TreeNode do not provides key
 */
export function warningWithoutKey(treeData: DataNode[], fieldNames: FieldNames) {
  const keys: Map<string, boolean> = new Map();

  function dig(list: DataNode[], path: string = '') {
    (list || []).forEach(treeNode => {
      //@ts-ignore original
      const key = treeNode[fieldNames.key];
      //@ts-ignore original
      const children = treeNode[fieldNames.children];
      // warning(
      //   key !== null && key !== undefined,
      //   `Tree node must have a certain key: [${path}${key}]`,
      // );

      const recordKey = String(key);
      // warning(
      //   !keys.has(recordKey) || key === null || key === undefined,
      //   `Same 'key' exist in the Tree: ${recordKey}`,
      // );
      keys.set(recordKey, true);

      dig(children, `${path}${recordKey} > `);
    });
  }

  dig(treeData);
}

/**
 * Convert `children` of Tree into `treeData` structure.
 */
export function convertTreeToData(rootNodes: React.VNode): DataNode[] {
  function dig(node: React.ComponentChildren): DataNode[] {
    const treeNodes = toArray(node) as NodeElement[];
    return treeNodes
      .map(treeNode => {
        // Filter invalidate node
        if (!isTreeNode(treeNode)) {
          // warning(!treeNode, 'Tree/TreeNode can only accept TreeNode as children.');
          return null;
        }

        const { key } = treeNode;
        const { children, ...rest } = treeNode.props;
        // @ts-ignore original
        const dataNode: DataNode = {
          key,
          ...rest,
        };

        const parsedChildren = dig(children!);
        if (parsedChildren.length) {
          dataNode.children = parsedChildren;
        }

        return dataNode;
      })
      //@ts-ignore original
      .filter((dataNode: DataNode) => dataNode);
  }

  return dig(rootNodes);
}

/**
 * Flat nest tree data into flatten list. This is used for virtual list render.
 * @param treeNodeList Origin data node list
 * @param expandedKeys
 * need expanded keys, provides `true` means all expanded (used in `rc-tree-select`).
 */
export function flattenTreeData(
  treeNodeList: DataNode[],
  expandedKeys: Key[] | true,
  fieldNames: FieldNames,
): FlattenNode[] {
  const {
    _title: fieldTitles,
    key: fieldKey,
    children: fieldChildren,
  } = fillFieldNames(fieldNames);

  const expandedKeySet = new Set(expandedKeys === true ? [] : expandedKeys);
  const flattenList: FlattenNode[] = [];

  function dig(list: DataNode[], parent: FlattenNode|null = null): FlattenNode[] {
    return list.map((treeNode, index) => {
      const pos: string = getPosition(parent ? parent.pos : '0', index);
      //@ts-ignore original
      const mergedKey = getKey(treeNode[fieldKey], pos);

      // Pick matched title in field title list
      let mergedTitle: React.VNode;
      for (let i = 0; i < fieldTitles.length; i += 1) {
        const fieldTitle = fieldTitles[i];
        //@ts-ignore original
        if (treeNode[fieldTitle] !== undefined) {
          //@ts-ignore original
          mergedTitle = treeNode[fieldTitle];
          break;
        }
      }

      // Add FlattenDataNode into list
      const flattenNode: FlattenNode = {
        ...omit(treeNode, [...fieldTitles, fieldKey, fieldChildren] as any),
        title: mergedTitle!,
        key: mergedKey,
        parent,
        pos,
        children: [], //null
        data: treeNode,
        isStart: [...(parent ? parent.isStart : []), index === 0],
        isEnd: [...(parent ? parent.isEnd : []), index === list.length - 1],
      };

      flattenList.push(flattenNode);

      // Loop treeNode children
      if (expandedKeys === true || expandedKeySet.has(mergedKey)) {
        // @ts-ignore original
        flattenNode.children = dig(treeNode[fieldChildren] || [], flattenNode);
      } else {
        flattenNode.children = [];
      }

      return flattenNode;
    });
  }

  dig(treeNodeList);

  return flattenList;
}

type ExternalGetKey = GetKey<DataNode> | string;

interface TraverseDataNodesConfig {
  childrenPropName?: string;
  externalGetKey?: ExternalGetKey;
  fieldNames?: FieldNames;
}

/**
 * Traverse all the data by `treeData`.
 * Please not use it out of the `rc-tree` since we may refactor this code.
 */
export function traverseDataNodes(
  dataNodes: DataNode[],
  callback: (data: {
    node: DataNode;
    index: number;
    pos: string;
    key: Key;
    parentPos: string | number|null;
    level: number;
    nodes: DataNode[];
  }) => void,
  // To avoid too many params, let use config instead of origin param
  config?: TraverseDataNodesConfig | string,
) {
  let mergedConfig: TraverseDataNodesConfig = {};
  if (typeof config === 'object') {
    mergedConfig = config;
  } else {
    mergedConfig = { externalGetKey: config };
  }
  mergedConfig = mergedConfig || {};

  // Init config
  const { childrenPropName, externalGetKey, fieldNames } = mergedConfig;

  const { key: fieldKey, children: fieldChildren } = fillFieldNames(fieldNames);

  const mergeChildrenPropName = childrenPropName || fieldChildren;

  // Get keys
  let syntheticGetKey: (node: DataNode, pos?: string) => Key;
  if (externalGetKey) {
    if (typeof externalGetKey === 'string') {
      syntheticGetKey = (node: DataNode) => (node as any)[externalGetKey as string];
    } else if (typeof externalGetKey === 'function') {
      syntheticGetKey = (node: DataNode) => (externalGetKey as GetKey<DataNode>)(node);
    }
  } else {
   // @ts-ignore original
    syntheticGetKey = (node, pos) => getKey(node[fieldKey], pos);
  }

  // Process
  function processNode(
    node: DataNode|null,
    index?: number,
    parent?: { node: DataNode|null; pos: string; level: number },
    pathNodes?: DataNode[],
  ) {
    // @ts-ignore original
    const children = node ? node[mergeChildrenPropName] : dataNodes;
    const pos = node ? getPosition(parent?.pos!, index!) : '0';
    const connectNodes = node ? [...(pathNodes??[]), node] : [];

    // Process node if is not root
    if (node) {
      const key: Key = syntheticGetKey(node, pos);
      const data = {
        node,
        index:index!,
        pos,
        key,
        parentPos: (parent?.node) ? parent.pos : null,
        level: (parent?.level??0) + 1,
        nodes: connectNodes,
      };

      callback(data);
    }

    // Process children node
    if (children) {
      children.forEach((subNode:any, subIndex:any) => {
        processNode(
          subNode,
          subIndex,
          {
            node,
            pos,
            level: parent ? parent.level + 1 : -1,
          },
          connectNodes,
        );
      });
    }
  }

  processNode(null);
}

interface Wrapper {
  posEntities: Record<string, DataEntity>;
  keyEntities: Record<Key, DataEntity>;
}

/**
 * Convert `treeData` into entity records.
 */
export function convertDataToEntities(
  dataNodes: DataNode[],
  {
    initWrapper,
    processEntity,
    onProcessFinished,
    externalGetKey,
    childrenPropName,
    fieldNames,
  }: {
    initWrapper?: (wrapper: Wrapper) => Wrapper;
    processEntity?: (entity: DataEntity, wrapper: Wrapper) => void;
    onProcessFinished?: (wrapper: Wrapper) => void;
    externalGetKey?: ExternalGetKey;
    childrenPropName?: string;
    fieldNames?: FieldNames;
  } = {},
  /** @deprecated Use `config.externalGetKey` instead */
  legacyExternalGetKey?: ExternalGetKey,
) {
  // Init config
  const mergedExternalGetKey = externalGetKey || legacyExternalGetKey;

  const posEntities:Record<any,any> = {};
  const keyEntities:Record<any,any> = {};
  let wrapper = {
    posEntities,
    keyEntities,
  };

  if (initWrapper) {
    wrapper = initWrapper(wrapper) || wrapper;
  }

  traverseDataNodes(
    dataNodes,
    item => {
      const { node, index, pos, key, parentPos, level, nodes } = item;
      const entity: DataEntity = { node, nodes, index, key, pos, level };

      const mergedKey = getKey(key, pos);

      posEntities[pos] = entity;
      keyEntities[mergedKey] = entity;

      // Fill children
      entity.parent = posEntities[parentPos??''];
      if (entity.parent) {
        entity.parent.children = entity.parent.children || [];
        entity.parent.children.push(entity);
      }

      if (processEntity) {
        processEntity(entity, wrapper);
      }
    },
    { externalGetKey: mergedExternalGetKey, childrenPropName, fieldNames },
  );

  if (onProcessFinished) {
    onProcessFinished(wrapper);
  }

  return wrapper;
}

export interface TreeNodeRequiredProps<TreeDataType extends BasicDataNode = DataNode> {
  expandedKeys: Key[];
  selectedKeys: Key[];
  loadedKeys: Key[];
  loadingKeys: Key[];
  checkedKeys: Key[];
  halfCheckedKeys: Key[];
  dragOverNodeKey: Key;
  dropPosition: number;
  keyEntities: Record<Key, DataEntity<TreeDataType>>;
}

/**
 * Get TreeNode props with Tree props.
 */
export function getTreeNodeProps<TreeDataType extends BasicDataNode = DataNode>(
  key: Key,
  {
    expandedKeys,
    selectedKeys,
    loadedKeys,
    loadingKeys,
    checkedKeys,
    halfCheckedKeys,
    dragOverNodeKey,
    dropPosition,
    keyEntities,
  }: TreeNodeRequiredProps<TreeDataType>,
) {
  const entity = keyEntities[key];

  const treeNodeProps = {
    eventKey: key,
    expanded: expandedKeys.indexOf(key) !== -1,
    selected: selectedKeys.indexOf(key) !== -1,
    loaded: loadedKeys.indexOf(key) !== -1,
    loading: loadingKeys.indexOf(key) !== -1,
    checked: checkedKeys.indexOf(key) !== -1,
    halfChecked: halfCheckedKeys.indexOf(key) !== -1,
    pos: String(entity ? entity.pos : ''),

    // [Legacy] Drag props
    // Since the interaction of drag is changed, the semantic of the props are
    // not accuracy, I think it should be finally removed
    dragOver: dragOverNodeKey === key && dropPosition === 0,
    dragOverGapTop: dragOverNodeKey === key && dropPosition === -1,
    dragOverGapBottom: dragOverNodeKey === key && dropPosition === 1,
  };

  return treeNodeProps;
}

export function convertNodePropsToEventData<TreeDataType extends BasicDataNode = DataNode>(
  props: TreeNodeProps<TreeDataType>,
): EventDataNode {
  const {
    data,
    expanded,
    selected,
    checked,
    loaded,
    loading,
    halfChecked,
    dragOver,
    dragOverGapTop,
    dragOverGapBottom,
    pos,
    active,
    eventKey,
  } = props;

  const eventData = {
    ...data,
    expanded,
    selected,
    checked,
    loaded,
    loading,
    halfChecked,
    dragOver,
    dragOverGapTop,
    dragOverGapBottom,
    pos,
    active,
    key: eventKey,
  };

  if (!('props' in eventData)) {
    Object.defineProperty(eventData, 'props', {
      get() {
        // warning(
        //   false,
        //   'Second param return from event is node data instead of TreeNode instance. Please read value directly instead of reading from `props`.',
        // );
        return props;
      },
    });
  }

  return eventData as EventDataNode;
}
