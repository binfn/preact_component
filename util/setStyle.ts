/// <reference lib="dom" />

import {JSX}  from '../deps.ts';

export interface SetStyleOptions {
  element?: HTMLElement;
}

/**
 * Easy to set element style, return previous style
 * IE browser compatible(IE browser doesn't merge overflow style, need to set it separately)
 * https://github.com/ant-design/ant-design/issues/19393
 *
 */
function setStyle(
  style: JSX.CSSProperties,
  options: SetStyleOptions = {},
): JSX.CSSProperties {
  if (!style) {
    return {};
  }

  const { element = document.body } = options;
  const oldStyle: JSX.CSSProperties = {};

  const styleKeys = Object.keys(style);

  // IE browser compatible
  styleKeys.forEach(key => {
    //@ts-ignore original
    oldStyle[key] = element.style[key];
  });

  styleKeys.forEach(key => {
    //@ts-ignore original
    element.style[key] = style[key];
  });

  return oldStyle;
}

export default setStyle;
