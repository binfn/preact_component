// deno-lint-ignore-file no-explicit-any

import * as React from "../../deps.ts";
import { Compat,isFragment } from "../../deps.ts";

//const isFragment=(instance:any)=>React.isValidElement(instance) && typeof instance.type === 'symbol'

export interface Option {
  keepEmpty?: boolean;
}
Compat.createElement
export default function toArray(
  children: React.ComponentChildren,
  option: Option = {},
): React.ComponentChild[] {
  let ret: Array<any> = [];

  Compat.Children.forEach(children, (child: any) => {
    if ((child === undefined || child === null) && !option.keepEmpty) {
      return;
    }

    if (Array.isArray(child)) {
      ret = ret.concat(toArray(child));
    } else if (isFragment(child) && child.props) {
      ret = ret.concat(toArray(child.props.children, option));
    } else {
      ret.push(child);
    }
  });

  return ret;
}
