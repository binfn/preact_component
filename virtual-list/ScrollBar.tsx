/// <reference lib="dom" />
/** @jsx  React.h */
/** @jsxFrag  React.Fragment */

import * as React from '../deps.ts';
import raf from '../util/raf.ts';

const MIN_SIZE = 20;

export interface ScrollBarProps {
  prefixCls: string;
  scrollTop: number;
  scrollHeight: number;
  height: number;
  count: number;
  onScroll: (scrollTop: number) => void;
  onStartMove: () => void;
  onStopMove: () => void;
}

interface ScrollBarState {
  dragging: boolean;
  pageY: number|null;
  startTop: number|null;
  visible: boolean;
}

function getPageY(e: MouseEvent | MouseEvent | TouchEvent) {
  return 'touches' in e ? e.touches[0].pageY : e.pageY;
}

export default class ScrollBar extends React.Component<ScrollBarProps, ScrollBarState> {
  moveRaf: number|null = null;

  scrollbarRef = React.createRef<HTMLDivElement>();

  thumbRef = React.createRef<HTMLDivElement>();

  visibleTimeout: number|null = null;

  state: ScrollBarState = {
    dragging: false,
    pageY: null,
    startTop: null,
    visible: false,
  };

  componentDidMount() {
    this.scrollbarRef.current?.addEventListener('touchstart', this.onScrollbarTouchStart);
    this.thumbRef.current?.addEventListener('touchstart', this.onMouseDown);
  }

  componentDidUpdate(prevProps: ScrollBarProps) {
    if (prevProps.scrollTop !== this.props.scrollTop) {
      this.delayHidden();
    }
  }

  componentWillUnmount() {
    this.removeEvents();
    clearTimeout(this.visibleTimeout!);
  }

  delayHidden = () => {
    clearTimeout(this.visibleTimeout!);

    this.setState({ visible: true });
    this.visibleTimeout = setTimeout(() => {
      this.setState({ visible: false });
    }, 2000);
  };

  onScrollbarTouchStart = (e: TouchEvent) => {
    e.preventDefault();
  };

  onContainerMouseDown: React.JSX.MouseEventHandler<any> = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // ======================= Clean =======================
  patchEvents = () => {
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);

    this.thumbRef.current?.addEventListener('touchmove', this.onMouseMove);
    this.thumbRef.current?.addEventListener('touchend', this.onMouseUp);
  };

  removeEvents = () => {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);

    this.scrollbarRef.current?.removeEventListener('touchstart', this.onScrollbarTouchStart);
    this.thumbRef.current?.removeEventListener('touchstart', this.onMouseDown);
    this.thumbRef.current?.removeEventListener('touchmove', this.onMouseMove);
    this.thumbRef.current?.removeEventListener('touchend', this.onMouseUp);

    raf.cancel(this.moveRaf!);
  };

  // ======================= Thumb =======================
  onMouseDown = (e: MouseEvent | TouchEvent) => {
    const { onStartMove } = this.props;

    this.setState({
      dragging: true,
      pageY: getPageY(e),
      startTop: this.getTop(),
    });

    onStartMove();
    this.patchEvents();
    e.stopPropagation();
    e.preventDefault();
  };

  onMouseMove = (e: MouseEvent | TouchEvent) => {
    const { dragging, pageY, startTop } = this.state;
    const { onScroll } = this.props;

    raf.cancel(this.moveRaf!);

    if (dragging) {
      const offsetY = getPageY(e) - pageY!;
      const newTop = startTop! + offsetY;

      const enableScrollRange = this.getEnableScrollRange();
      const enableHeightRange = this.getEnableHeightRange();

      const ptg = enableHeightRange ? newTop / enableHeightRange : 0;
      const newScrollTop = Math.ceil(ptg * enableScrollRange);
      this.moveRaf = raf(() => {
        onScroll(newScrollTop);
      });
    }
  };

  onMouseUp = () => {
    const { onStopMove } = this.props;
    this.setState({ dragging: false });

    onStopMove();
    this.removeEvents();
  };

  // ===================== Calculate =====================
  getSpinHeight = () => {
    const { height, count } = this.props;
    let baseHeight = (height / count) * 10;
    baseHeight = Math.max(baseHeight, MIN_SIZE);
    baseHeight = Math.min(baseHeight, height / 2);
    return Math.floor(baseHeight);
  };

  getEnableScrollRange = () => {
    const { scrollHeight, height } = this.props;
    return scrollHeight - height || 0;
  };

  getEnableHeightRange = () => {
    const { height } = this.props;
    const spinHeight = this.getSpinHeight();
    return height - spinHeight || 0;
  };

  getTop = () => {
    const { scrollTop } = this.props;
    const enableScrollRange = this.getEnableScrollRange();
    const enableHeightRange = this.getEnableHeightRange();
    if (scrollTop === 0 || enableScrollRange === 0) {
      return 0;
    }
    const ptg = scrollTop / enableScrollRange;
    return ptg * enableHeightRange;
  };

  // Not show scrollbar when height is large than scrollHeight
  showScroll = (): boolean => {
    const { height, scrollHeight } = this.props;
    return scrollHeight > height;
  };

  // ====================== Render =======================
  render() {
    const { dragging, visible } = this.state;
    const { prefixCls } = this.props;
    const spinHeight = this.getSpinHeight();
    const top = this.getTop();

    const canScroll = this.showScroll();
    const mergedVisible = canScroll && visible;

    return (
      <div
        ref={this.scrollbarRef}
        className={`${prefixCls}-scrollbar `+(canScroll?`${prefixCls}-scrollbar-show`:'')}
        style={{
          width: 8,
          top: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: mergedVisible ? null : 'none',
        }}
        onMouseDown={this.onContainerMouseDown}
        onMouseMove={this.delayHidden}
      >
        <div
          ref={this.thumbRef}
          className={`${prefixCls}-scrollbar-thumb `+(dragging?`${prefixCls}-scrollbar-thumb-moving`:'')}
          style={{
            width: '100%',
            height: spinHeight,
            top,
            left: 0,
            position: 'absolute',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 99,
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onMouseDown={this.onMouseDown}
        />
      </div>
    );
  }
}
