import * as React from '../deps.ts';

export type RenderFunc<T> = (
  item: T,
  index: number,
  props: { style?: React.JSX.CSSProperties },
) => React.VNode;

export interface SharedConfig<T> {
  getKey: (item: T) => React.Key;
}

export type GetKey<T> = (item: T) => React.Key;
