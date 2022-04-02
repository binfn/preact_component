/// <reference lib="dom" />
/** @jsx  React.h */
/** @jsxFrag  React.Fragment */

// deno-lint-ignore-file no-explicit-any

import * as React from '../deps.ts';
import type { ListProps, ListRef } from './List.tsx';
import { RawList } from './List.tsx';

const List = React.Compat.forwardRef((props: ListProps<any>, ref: React.Ref<ListRef>) =>
  RawList({ ...props, virtual: false }, ref),
);

(List as any).displayName = 'List';

export default List;
