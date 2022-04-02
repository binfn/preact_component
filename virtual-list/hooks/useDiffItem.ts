import * as React from '../../deps.ts';
import { findListDiffIndex } from '../utils/algorithmUtil.ts';
import type { GetKey } from '../interface.ts';

export default function useDiffItem<T>(
  data: T[],
  getKey: GetKey<T>,
  onDiff?: (diffIndex: number) => void,
): [T] {
  const [prevData, setPrevData] = React.useState(data);
  const [diffItem, setDiffItem] = React.useState<any>(null);

  React.useEffect(() => {
    const diff = findListDiffIndex(prevData || [], data || [], getKey);
    if (diff?.index !== undefined) {
      onDiff?.(diff.index);
      setDiffItem(data[diff.index]);
    }
    setPrevData(data);
  }, [data]);

  return [diffItem];
}
