import * as React from '../deps.ts';

interface TriggerContextProps {
  onPopupMouseDown: React.JSX.MouseEventHandler<HTMLElement>;
}

const TriggerContext = React.createContext<TriggerContextProps|null>(null);

export default TriggerContext;
