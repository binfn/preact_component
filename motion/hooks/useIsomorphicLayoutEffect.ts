import { useEffect, useLayoutEffect } from '../../deps.ts';
import canUseDom from '../../util/Dom/canUseDom.ts';

// It's safe to use `useLayoutEffect` but the warning is annoying
const useIsomorphicLayoutEffect = canUseDom() ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
