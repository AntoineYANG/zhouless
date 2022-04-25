/*
 * @Author: Kanata You 
 * @Date: 2022-04-20 22:52:57 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-25 15:03:48
 */

import React from 'react';
import styled from 'styled-components';

import icon from '@public/logo256.png';
import MenuItem from './menu-item';
import Buttons from './buttons';
import Menu from './menu';


const TitleBarElement = styled.nav({
  position: 'relative',
  top: 0,
  left: 0,
  width: '100%',
  height: '26px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  WebkitAppRegion: 'drag', // 响应 Electron 窗口的响应拖拽
  userSelect: 'none',
  '@media (prefers-color-scheme: dark)': {
    color: '#bbb',
    backgroundColor: '#222',
  },
  '@media (prefers-color-scheme: light)': {
    color: '#444',
    backgroundColor: '#eee',
  },
});

const IconElement = styled.img({
  flexGrow: 0,
  fontSize: 0,
  width: '19px',
  height: '19px',
  margin: '4px 6px',
});

const TitleBarMenu = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  height: '100%',
  margin: '0 4px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'baseline',
  fontSize: '1.1rem',
  lineHeight: '26px',
  justifyContent: 'center',
});

const TitleBarTitle = styled.div({
  flexGrow: 1,
  flexShrink: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.1rem',
  fontWeight: 400,
  overflow: 'hidden',
});

const TitleBarButtonGroup = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
});

export interface TitleBarProps {
  menu: Menu;
  safeCloseProject: () => Promise<boolean>;
}

/**
 * 窗口顶部标题 & 工具栏.
 */
const TitleBar: React.FC<TitleBarProps> = React.memo(function TitleBar ({
  menu,
  safeCloseProject,
}) {
  const menuBarRef = React.useRef<HTMLDivElement>();
  const [forceUpdateFlag, forceUpdate] = React.useState(false);

  React.useEffect(() => {
    let lock = false;
    let isAlt = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.visibilityState === 'hidden') {
        return e.preventDefault();
      }

      if (lock || e.key !== 'Alt' || isAlt) {
        return;
      }

      isAlt = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (document.visibilityState === 'hidden') {
        return e.preventDefault();
      }

      if (lock || e.key !== 'Alt' || !isAlt) {
        return;
      }

      lock = true;
      
      requestAnimationFrame(() => {
        lock = false;
        isAlt = false;
      });

      const curFocusedElement = document.querySelector(':focus');

      if (curFocusedElement?.getAttribute('role') === 'menuitem') {
        (curFocusedElement as HTMLDivElement).blur();
      } else {
        (menuBarRef.current?.children?.[0] as HTMLDivElement | undefined)?.focus();
      }
    };

    const handleWindowFocusChange = () => {
      const curFocusedElement = document.querySelector(':focus');

      if (curFocusedElement?.getAttribute('role') === 'menuitem') {
        (curFocusedElement as HTMLDivElement).blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('visibilitychange', handleWindowFocusChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleWindowFocusChange);
    };
  }, []);
  
  return (
    <TitleBarElement>
      <IconElement
        src={icon}
        alt="icon"
      />
      <TitleBarMenu
        role="menubar"
        aria-orientation="horizontal"
        ref={e => e && (menuBarRef.current = e)}
      >
        {
          menu.getMenu().map((m, i) => (
            <MenuItem
              key={i}
              {...m}
              onClick={() => forceUpdate(!forceUpdateFlag)}
            />
          ))
        }
      </TitleBarMenu>
      <TitleBarTitle>
        zhouless
      </TitleBarTitle>
      <TitleBarButtonGroup>
        <Buttons
          safeCloseProject={safeCloseProject}
        />
      </TitleBarButtonGroup>
    </TitleBarElement>
  );
});


export default TitleBar;
