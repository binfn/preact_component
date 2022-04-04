/// <reference lib="dom" />
// deno-lint-ignore-file no-explicit-any
import {Compat as ReactDOM}  from '../../deps.ts';
export default function addEventListenerWrap(target: EventTarget, eventType: string, cb: any, option?: any) {
  /* eslint camelcase: 2 */
  const callback = ReactDOM.unstable_batchedUpdates
    ? function run(e: any) {
        ReactDOM.unstable_batchedUpdates(cb, e);
      }
    : cb;
  if (target.addEventListener) {
    target.addEventListener(eventType, callback, option);
  }
  return {
    remove: () => {
      if (target.removeEventListener) {
        target.removeEventListener(eventType, callback);
      }
    },
  };
}
