/*
 * @Author: Kanata You 
 * @Date: 2022-04-24 15:08:54 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-25 17:05:22
 */

import React from 'react';
import styled from 'styled-components';

import type EditorContext from '@views/context';
import type { EditorContextDispatcher } from '@views/context';
import { useTranslation } from 'react-i18next';


const ShouldCloseDialogContainer = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1024,
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#aaa2',
});

const ShouldCloseDialogTitleSpace = styled.div({
  flexGrow: 0,
  flexShrink: 1,
  width: '100%',
  height: '26px', // TitleBar 高度：这个区域不要模糊
  backgroundColor: '#aaa2',
});

const ShouldCloseDialogMain = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  width: '100%',
  height: '26px', // TitleBar 高度：这个区域不要模糊
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(4px)',
});

const ShouldCloseDialogElement = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  minWidth: '30vw',
  fontSize: '1rem',
  lineHeight: '1.6em',
  border: '1px solid',
  backdropFilter: 'blur(12px)',
  display: 'flex',
  flexDirection: 'column',

  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#32343560',
    color: '#eee',
    borderColor: '#ededed60',
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#ededed60',
    color: '#222',
    borderColor: '#32343560',
  },
});

const ShouldCloseDialogMessage = styled.div({
  minHeight: '4em',
  paddingBlockStart: '2em',
  paddingBlockEnd: '1em',
  paddingInlineStart: '10%',
  paddingInlineEnd: '10%',
});

const ShouldCloseDialogButtonGroup = styled.div({
  flexShrink: 0,
  paddingBlockStart: '0.6em',
  paddingBlockEnd: '1.2em',
  paddingInlineStart: '10%',
  paddingInlineEnd: '10%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
});

const ShouldCloseDialogButton = styled.div<{ warn?: boolean }>(({ warn }) => ({
  outline: 'none',
  flexGrow: 0,
  flexShrink: 0,
  width: '6em',
  height: '1.6em',
  marginInlineStart: '1.4em',
  marginInlineEnd: '1.4em',
  paddingBlockStart: '0.3em',
  paddingBlockEnd: '0.3em',
  textAlign: 'center',
  border: '1px solid',
  cursor: 'pointer',
  userSelect: 'none',
  backgroundColor: warn ? '#b926' : '#8882',

  ':focus, :hover': {
    borderRadius: '8px',
    backgroundColor: warn ? '#f42' : '#8884',
    transform: 'scale(1.2)',
  },
  transition: 'color 200ms, border-radius 200ms, transform 200ms',
}));

const FocusContainer = styled.div({
  display: 'absolute',
  width: '1px',
  height: '1px',
  pointerEvents: 'none',
});

export interface ShouldCloseDialogProps {
  context: React.Context<EditorContext>;
  dispatch: EditorContextDispatcher;
}

const ShouldCloseDialog: React.FC<ShouldCloseDialogProps> = React.memo(function ShouldCloseDialog ({
  context,
  dispatch,
}) {
  const idBtnYes = React.useId();
  const idBtnNo = React.useId();
  const { t } = useTranslation();
  const { isClosing } = React.useContext(context);
  
  const open = Boolean(isClosing);

  React.useEffect(() => {
    if (open) {
      document.getElementById(idBtnNo)?.focus?.();
    }
  }, [open]);

  const handleClickYes = React.useCallback(() => {
    if (open) {
      dispatch({
        type: 'UNSAFE_CLOSE',
        payload: {
          shouldClose: true
        }
      });
    }
  }, [open, dispatch]);

  const handleClickNo = React.useCallback(() => {
    if (open) {
      dispatch({
        type: 'UNSAFE_CLOSE',
        payload: {
          shouldClose: false
        }
      });
    }
  }, [open]);

  const handleKeyPress = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.click();
    }
  }, []);

  const handleMouseOver = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.focus();
  }, []);

  const handleMouseOut = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.blur();
  }, []);
  
  return open ? (
    <ShouldCloseDialogContainer>
      <ShouldCloseDialogTitleSpace />
      <ShouldCloseDialogMain>
        <ShouldCloseDialogElement
          role="dialog"
          aria-live="assertive"
          aria-modal
        >
          <ShouldCloseDialogMessage>
            {t('dialog.msg')}
          </ShouldCloseDialogMessage>
          <ShouldCloseDialogButtonGroup>
            <FocusContainer
              tabIndex={1}
              // 保证焦点不离开两个按钮
              onFocus={() => document.getElementById(idBtnYes)?.focus?.()}
            />
            <ShouldCloseDialogButton
              tabIndex={2}
              id={idBtnNo}
              onClick={handleClickNo}
              onKeyPress={handleKeyPress}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              {t('dialog.no')}
            </ShouldCloseDialogButton>
            <ShouldCloseDialogButton
              warn
              id={idBtnYes}
              tabIndex={3}
              onClick={handleClickYes}
              onKeyPress={handleKeyPress}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              {t('dialog.yes')}
            </ShouldCloseDialogButton>
            <FocusContainer
              tabIndex={4}
              // 保证焦点不离开两个按钮
              onFocus={() => document.getElementById(idBtnNo)?.focus?.()}
            />
          </ShouldCloseDialogButtonGroup>
        </ShouldCloseDialogElement>
      </ShouldCloseDialogMain>
    </ShouldCloseDialogContainer>
  ) : null;
});


export default ShouldCloseDialog;
