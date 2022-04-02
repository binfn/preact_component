/// <reference lib="dom" />
import {Component,Compat as ReactDOM}  from '../../deps.ts';
/**
 * Return if a node is a DOM node. Else will return by `findDOMNode`
 */
export default function findDOMNode<T = Element | Text>(
  node: Component | HTMLElement,
): T {
  if (node instanceof HTMLElement) {
    return (node as unknown) as T;
  }
  return (ReactDOM.findDOMNode(node) as unknown) as T;
}
