/// <reference lib="dom" />

export * from "https://esm.sh/preact@10.x.x";

export {default as Compat} from "https://esm.sh/preact@10.x.x/compat";
// import { VNode } from "https://esm.sh/preact@10.x.x";
// type ReactElement=Element
// type ReactNode=VNode
// export type { ReactNode,ReactElement }
export { isFragment,isMemo } from "https://esm.sh/react-is";
// type UIEvent=JSX.TargetedEvent
// export type { UIEvent }
import ResizeObserver from "https://esm.sh/resize-observer-polyfill";

export {ResizeObserver}

export {
  useCallback,
  useContext,
  useDebugValue,
  useEffect,
  useErrorBoundary,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "https://esm.sh/preact@10.x.x/hooks";
export type {
  CreateHandle,
  EffectCallback,
  Inputs,
  PropRef,
  Reducer,
  Ref,
  StateUpdater,
} from "https://esm.sh/preact@10.x.x/hooks";
