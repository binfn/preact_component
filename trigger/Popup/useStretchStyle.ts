import * as React from '../../deps.ts';
import type { StretchType } from '../interface.ts';

export default (
  stretch?: StretchType,
): [React.JSX.CSSProperties, (element: HTMLElement) => void] => {
  const [targetSize, setTargetSize] = React.useState({ width: 0, height: 0 });

  function measureStretch(element: HTMLElement) {
    setTargetSize({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
  }

  // Merge stretch style
  const style = React.useMemo<React.JSX.CSSProperties>(() => {
    const sizeStyle: React.JSX.CSSProperties = {};

    if (stretch) {
      const { width, height } = targetSize;

      // Stretch with target
      if (stretch.indexOf('height') !== -1 && height) {
        sizeStyle.height = height;
      } else if (stretch.indexOf('minHeight') !== -1 && height) {
        sizeStyle.minHeight = height;
      }
      if (stretch.indexOf('width') !== -1 && width) {
        sizeStyle.width = width;
      } else if (stretch.indexOf('minWidth') !== -1 && width) {
        sizeStyle.minWidth = width;
      }
    }

    return sizeStyle;
  }, [stretch, targetSize]);

  return [style, measureStretch];
};
