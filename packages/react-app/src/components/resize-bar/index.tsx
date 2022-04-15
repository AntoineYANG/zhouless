/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 16:38:33 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-15 22:11:40
 */

import React from 'react';
import styled from 'styled-components';

import debounce from '@utils/debounce';


const SIZE = 20;

const ResizeBarElement = styled.div<{ direction: 'ew' | 'ns' }>(({ direction }) => ({
  position: 'absolute',
  backgroundColor: '#fff2',
  backdropFilter: 'brightness(1.25) blur(1.5px)',
  ...(direction === 'ew' ? {
    // horizontal -> at right
    top: 0,
    right: 0,
    width: `${SIZE}px`,
    height: '100%',
    transform: 'translateX(50%)',
    cursor: 'ew-resize',
  } : {
    // vertical -> at bottom
    left: 0,
    bottom: 0,
    width: '100%',
    height: `${SIZE}px`,
    transform: 'translateY(50%)',
    cursor: 'ns-resize',
  }),
  opacity: 0.01,
  '&:hover, &.active': {
    opacity: 1
  },
  transition: 'opacity 200ms',
}));

export interface ResizeBarProps {
  /** 方向，默认为 ns */
  direction?: 'ew' | 'ns';
  container: HTMLElement | undefined;
  target: HTMLElement | undefined | null;
  /** 比例，默认为 0.25 */
  min?: number;
  /** 比例，默认为 1 */
  max?: number;
  /** 注意用 useCallback 包裹，不然组件会一直刷新 */
  onResize: (px: number) => void;
  /** 触发回调的时长，单位 ms，默认为 20 */
  debounceSpan?: number;
}

/**
 * 调整视窗大小的交互工具.
 */
const ResizeBar: React.FC<ResizeBarProps> = React.memo(function ResizeBar ({
  direction = 'ns',
  container,
  target,
  min = 0.25,
  max = 1,
  onResize,
  debounceSpan = 20
}) {
  const [element, setElement] = React.useState<HTMLDivElement>();

  const callback = React.useCallback(
    debounce(onResize, debounceSpan),
    [onResize, debounceSpan]
  );

  // 屏蔽 drag 事件
  React.useEffect(() => {
    element?.addEventListener(
      'dragstart',
      e => {
        e.preventDefault();
      }, {
        passive: false // passive 需要设置为 false，只能用原生的，React 不支持
      }
    );
  }, [element]);

  // 设置监听逻辑
  React.useEffect(() => {
    if (!element || !target || !container) {
      return;
    }

    const targetPos = target[direction === 'ns' ? 'offsetTop' : 'offsetLeft'];
    const containerSize = container[direction === 'ns' ? 'clientHeight' : 'clientWidth'];
    const minSizePx = targetPos + containerSize * min;
    const maxSizePx = targetPos + containerSize * max;

    let resizing = false;
    let offset = NaN;
    let curPos = NaN;
    let thisElement: HTMLDivElement | null = null;

    const handleResizeStart = (e: MouseEvent) => {
      thisElement = e.currentTarget as HTMLDivElement;
      curPos = e[direction === 'ns' ? 'clientY' : 'clientX'];

      offset = e[
        direction === 'ns' ? 'clientY' : 'clientX'
      ] - thisElement[
        direction === 'ns' ? 'offsetTop' : 'offsetLeft'
      ] - /* 元素本身宽度造成的偏移量 */ SIZE;
      resizing = true;
      thisElement.classList.add('active');
    };

    const handleResizing = (e: MouseEvent) => {
      if (!resizing) {
        return;
      }

      if (e.buttons === 0) {
        // 切出界面未触发 mouseup，此时判断鼠标左键已经抬起
        resizing = false;
        thisElement?.classList.remove('active');
        return;
      }

      const { [direction === 'ns' ? 'clientY' : 'clientX']: absPos } = e;

      if (curPos === absPos) {
        return;
      }

      curPos = absPos;

      const validPos = Math.min(
        maxSizePx,
        Math.max(
          minSizePx,
          absPos
        )
      );

      const px = (validPos - offset) - targetPos;

      callback(px);
    };

    const handleResizeEnd = (e: MouseEvent) => {
      if (resizing) {
        resizing = false;
        thisElement?.classList.remove('active');
      }
    };

    element.addEventListener('mousedown', handleResizeStart);
    document.body.addEventListener('mousemove', handleResizing);
    document.body.addEventListener('mouseup', handleResizeEnd);

    return () => {
      element.removeEventListener('mousedown', handleResizeStart);
      document.body.removeEventListener('mousemove', handleResizing);
      document.body.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [element, target, container, min, max, debounceSpan, callback]);

  return (
    <ResizeBarElement
      ref={e => element || (e && setElement(e))}
      direction={direction}
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      onMouseUp={e => e.stopPropagation()}
      onMouseMove={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
      onTouchMove={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
    >
    </ResizeBarElement>
  );
});


export default ResizeBar;
