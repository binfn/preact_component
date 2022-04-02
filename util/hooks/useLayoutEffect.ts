import * as React from '../../deps.ts';
import canUseDom from '../Dom/canUseDom.ts';

/**
 * Wrap `React.useLayoutEffect` which will not throw warning message in test env
 */
const useLayoutEffect =
  canUseDom()
    ? React.useLayoutEffect
    : React.useEffect;

export default useLayoutEffect;
