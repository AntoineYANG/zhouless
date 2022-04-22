/*
 * @Author: Kanata You 
 * @Date: 2022-04-22 19:31:13 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-22 22:43:46
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';


const Button = styled.div<{
  big?: boolean;
  pressed?: boolean;
  busy?: boolean;
}>(({ big, pressed, busy }) => ({
  outline: 'none',
  flexGrow: 0,
  flexShrink: 0,
  width: big ? '44px' : '28px',
  height: big ? '44px' : '28px',
  borderRadius: '50%',
  marginInlineStart: big ? '6px' : '4px',
  marginInlineEnd: big ? '6px' : '4px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: busy ? 'default' : 'pointer',
  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#1e1e1e',
    border: '1.5px solid #44c6',
    boxShadow: busy ? undefined : (
      pressed ? (
        `1px 1px 5px -1px #0008, inset ${
          big ? '8px 6px 14px' : '6px 5px 12px'
        } 2px #0002`
      ) : (
        `1px 1px 5px -1px #0008, inset ${
          big ? '8px 6px 14px' : '6px 5px 12px'
        } 2px #ffffff0c`
      )
    ),

    ':focus': {
      boxShadow: (
        `1px 1px 5px -1px #0008, inset ${
          big ? '8px 6px 14px' : '6px 5px 12px'
        } 2px #0002`
      ),
    },
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#e4e4e4',
    border: '1.5px solid #6666',
    boxShadow: busy ? undefined : (
      pressed ? (
        `1px 1px 5px -1px #0008, inset ${
          big ? '8px 6px 14px' : '6px 5px 12px'
        } 2px #0002`
      ) : (
        `1px 1px 5px -1px #0008, inset ${
          big ? '8px 6px 14px' : '6px 5px 12px'
        } 2px #fff`
      )
    ),

    ':focus': {
      boxShadow: (
        `1px 1px 5px -1px #0008, inset ${
          big ? '8px 6px 14px' : '6px 5px 12px'
        } 2px #0002`
      ),
    },
  },
  transition: 'border-color 200ms, box-shader 200ms, background-color 200ms',

  '& > svg': {
    width: '90%',
    height: '90%',
    borderRadius: '50%',
    opacity: busy ? 0.4 : 0.9,
    pointerEvents: 'none',

    '& > path': {
      fill: 'none',

      '@media (prefers-color-scheme: dark)': {
        stroke: '#999',
      },
      '@media (prefers-color-scheme: light)': {
        stroke: '#777',
      },
    }
  },
}));

export interface PlayControlButtonProps {
  name: string;
  big?: boolean;
  disabled?: boolean;
  onPressed?: () => void;
  action: (() => Promise<any>) | (() => any);
  hotkey?: string;
  svg: string;
}

const PlayControlButton: React.FC<PlayControlButtonProps> = React.memo(function PlayControlButton ({
  name,
  big,
  disabled,
  onPressed,
  action,
  hotkey,
  svg,
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const triggerMethodRef = React.useRef<'click' | 'hotkey'>('click');

  const handleMouseDown = React.useCallback(() => {
    triggerMethodRef.current = 'click';
    onPressed?.();
    setPressed(true);
  }, [onPressed, setPressed, triggerMethodRef]);

  React.useEffect(() => {
    if (!pressed) {
      return;
    }

    const handleUp = () => {
      setPressed(false);
    };

    const handleMove = (e: MouseEvent) => {
      if (triggerMethodRef.current === 'click' && e.buttons !== 1) {
        // 左键未按下
        setPressed(false);
      }
    };

    document.addEventListener('mouseup', handleUp);
    document.addEventListener('mousemove', handleMove);

    return () => {
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('mousemove', handleMove);
    };
  }, [pressed, setPressed, triggerMethodRef]);

  const trigger = React.useCallback(() => {
    if (busy || disabled) {
      return;
    }

    setBusy(true);

    Promise.resolve(action()).finally(() => setBusy(false));
  }, [busy, disabled, setBusy, action]);

  const handleMouseUp = React.useCallback(() => {
    if (pressed) {
      setPressed(false);
      trigger();
    }
  }, [pressed, setPressed, trigger]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (pressed) {
        return;
      }

      if (e.key === hotkey) {
        triggerMethodRef.current = 'hotkey';
        setPressed(true);
        onPressed?.();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === hotkey) {
        handleMouseUp();
      }
    };

    document.body.addEventListener('keydown', handleKeyDown);
    document.body.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.body.removeEventListener('keydown', handleKeyDown);
      document.body.removeEventListener('keyup', handleKeyUp);
    };
  }, [trigger, hotkey, pressed, setPressed, triggerMethodRef, handleMouseUp]);

  return (
    <Button
      role="button"
      tabIndex={busy || disabled ? undefined : 0}
      aria-disabled={busy || disabled}
      busy={busy || (disabled ?? false)}
      big={big ?? false}
      pressed={pressed}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      title={`${t(name)}${hotkey ? ` (${hotkey.replace(/^ $/, 'Space')})` : ''}`}
    >
      <svg viewBox="0 0 20 20" >
        <path
          d={svg}
        />
      </svg>
    </Button>
  );
});


export default PlayControlButton;
