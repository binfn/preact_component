/** @jsx  React.h */
/** @jsxFrag  React.Fragment */

import * as React from '../../deps.ts';

export default (callback: () => boolean, buffer: number) => {
  const calledRef = React.useRef<boolean>(false);
  const timeoutRef = React.useRef<number>();

  function cancelTrigger() {
    window.clearTimeout(timeoutRef.current);
  }

  function trigger(force?: boolean) {
    if (!calledRef.current || force === true) {
      if (callback() === false) {
        // Not delay since callback cancelled self
        return;
      }

      calledRef.current = true;
      cancelTrigger();
      timeoutRef.current = window.setTimeout(() => {
        calledRef.current = false;
      }, buffer);
    } else {
      cancelTrigger();
      timeoutRef.current = window.setTimeout(() => {
        calledRef.current = false;
        trigger();
      }, buffer);
    }
  }

  return [
    trigger,
    () => {
      calledRef.current = false;
      cancelTrigger();
    },
  ];
};