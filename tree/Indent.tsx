/** @jsx  React.h */
/** @jsxFrag  React.Fragment */

import * as React from '../deps.ts';


interface IndentProps {
  prefixCls: string;
  level: number;
  isStart: boolean[];
  isEnd: boolean[];
}

const Indent = ({ prefixCls, level, isStart, isEnd }: IndentProps) => {
  const baseClassName = `${prefixCls}-indent-unit`;
  const list: React.VNode[] = [];
  for (let i = 0; i < level; i += 1) {
    list.push(
      <span
        key={i}
        className={baseClassName
          +' '+(isStart[i]?`${baseClassName}-start`:'')
          +' '+(isEnd[i]?`${baseClassName}-end`:'')
          }
      />,
    );
  }

  return (
    <span aria-hidden="true" className={`${prefixCls}-indent`}>
      {list}
    </span>
  );
};

export default React.Compat.memo(Indent);
