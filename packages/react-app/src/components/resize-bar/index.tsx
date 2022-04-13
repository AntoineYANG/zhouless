/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 16:38:33 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-13 22:47:10
 */

import React from 'react';
import styled from 'styled-components';

import debounce from '@utils/debounce';


const ResizeBarElement = styled.div({
  position: 'absolute',
  left: 0,
  bottom: 0,
  width: '100%',
  height: '16px',
  backgroundColor: '#fff2',
  backdropFilter: 'brightness(1.25) blur(1.5px)',
  transform: 'translateY(50%)',
  cursor: 'ns-resize',
  opacity: 0.01,
  '&:hover, &.active': {
    opacity: 1
  },
  transition: 'opacity 200ms'
});

export interface ResizeBarProps {
  container: HTMLElement;
  target: HTMLElement | undefined | null;
  /** 比例，默认为 0.25 */
  min?: number;
  /** 比例，默认为 1 */
  max?: number;
  /** 注意用 useCallback 包裹，不然组件会一直刷新 */
  onResize: (h: number) => void;
  /** 触发回调的时长，单位 ms，默认为 20 */
  debounceSpan?: number;
}

/**
 * 调整视窗大小的交互工具.
 */
const ResizeBar: React.FC<ResizeBarProps> = React.memo(function ResizeBar ({
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

  React.useEffect(() => {
    element?.addEventListener(
      'dragstart',
      e => {
        e.preventDefault();
      }, {
        passive: false
      }
    );
  }, [element]);

  React.useEffect(() => {
    if (!element || !target) {
      return;
    }

    const targetY = target.offsetTop;
    const containerHeight = container.clientHeight;
    const highest = targetY + containerHeight * min;
    const lowest = targetY + containerHeight * max;

    let resizing = false;
    let dy = NaN;
    let curY = NaN;
    let thisElement: HTMLDivElement | null = null;

    const handleResizeStart = (e: MouseEvent) => {
      thisElement = e.currentTarget as HTMLDivElement;
      dy = e.clientY - thisElement.offsetTop;
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

      const { clientY: absY } = e;

      if (curY === absY) {
        return;
      }

      curY = absY;

      if (absY > lowest || absY < highest) {
        return;
      }

      const height = (absY + dy - 10) - targetY;

      callback(height);
    };

    const handleResizeEnd = () => {
      resizing = false;
      thisElement?.classList.remove('active');
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
    >
    </ResizeBarElement>
  );
});


export default ResizeBar;
